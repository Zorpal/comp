from django.db import connection

def cosine_similarity(vec1, vec2):
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude1 = sum(a * a for a in vec1) ** 0.5
    magnitude2 = sum(b * b for b in vec2) ** 0.5
    if magnitude1 == 0 or magnitude2 == 0:
        return 0
    return dot_product / (magnitude1 * magnitude2)

def getjob(job_id):
    with connection.cursor() as cursor:
        cursor.execute("SELECT jobprimaryskill, jobsecondaryskill FROM TRL_JobDetails WHERE id = %s", [job_id])
        row = cursor.fetchone()
    return row

def getapplicantemail():
    with connection.cursor() as cursor:
        cursor.execute("SELECT email FROM TRL_ApplicantDetails")
        rows = cursor.fetchall()
    return [row[0] for row in rows]

def getapplicantskills():
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT TRL_ApplicantDetails.email, TRL_Skill.name 
            FROM TRL_ApplicantDetails 
            JOIN TRL_ApplicantSkill ON TRL_ApplicantDetails.email = TRL_ApplicantSkill.applicant_email
            JOIN TRL_Skill ON TRL_ApplicantSKill.skill_id = TRL_Skill.id
        """)
        rows = cursor.fetchall()
    applicant_skills = {}
    for email, skill in rows:
        if email not in applicant_skills:
            applicant_skills[email] = []
        applicant_skills[email].append(skill)
    return applicant_skills

def getskillnames():
    with connection.cursor() as cursor:
        cursor.execute("SELECT name FROM TRL_Skill")
        rows = cursor.fetchall()
    return [row[0] for row in rows]

def filterapplicant(job_id):
    job_primary_skill, job_secondary_skill = getjob(job_id)
    job_skills = [job_primary_skill, job_secondary_skill]

    applicantemail = getapplicantemail()
    applicant_skills = getapplicantskills()
    listofskills = getskillnames()

    skill_matrix = []
    filtered_applicants = []
    for applicant in applicantemail:
        skill_vector = [1 if skill in applicant_skills.get(applicant, []) else 0 for skill in listofskills]
        if any(skill in job_skills for skill in applicant_skills.get(applicant, [])):
            skill_matrix.append(skill_vector)
            filtered_applicants.append(applicant)

    job_vector = [1 if skill in job_skills else 0 for skill in listofskills]

    similarity_scores = [cosine_similarity(skill_vector, job_vector) for skill_vector in skill_matrix]

    stack = []
    for i, score in enumerate(similarity_scores):
        matching_skills = sum(1 for skill in job_skills if skill in applicant_skills.get(filtered_applicants[i], []))
        if matching_skills == 2:
            stack.append(filtered_applicants[i])
        else:
            stack.insert(0, filtered_applicants[i])

    recommended_applicants = stack[::-1]
    return recommended_applicants
