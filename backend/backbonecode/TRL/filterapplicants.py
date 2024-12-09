from django.db import connection

# Function to calculate cosine similarity between two vectors
def cosine_similarity(vec1, vec2):
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude1 = sum(a * a for a in vec1) ** 0.5
    magnitude2 = sum(b * b for b in vec2) ** 0.5
    if magnitude1 == 0 or magnitude2 == 0:
        return 0
    return dot_product / (magnitude1 * magnitude2)

#function to get job details (primary and secondary skills) by job ID
def getjob(job_id):
    with connection.cursor() as cursor:
        cursor.execute("SELECT jobprimaryskill, jobsecondaryskill FROM TRL_JobDetails WHERE id = %s", [job_id])
        row = cursor.fetchone()
    return row

# Function to get all applicant emails and their timestamps as applicants should also be sorted on a first come first serve
def getapplicantemail():
    with connection.cursor() as cursor:
        cursor.execute("SELECT email, timestamp FROM TRL_ApplicantDetails")
        rows = cursor.fetchall()
    return [(row[0], row[1]) for row in rows]

#Function to get all applicants' skills
def getapplicantskills():
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT TRL_ApplicantDetails.email, TRL_Skill.name 
            FROM TRL_ApplicantDetails 
            JOIN TRL_ApplicantSkill ON TRL_ApplicantDetails.email = TRL_ApplicantSkill.applicant_email
            JOIN TRL_Skill ON TRL_ApplicantSkill.skill_id = TRL_Skill.id
        """)
        rows = cursor.fetchall()
    applicant_skills = {}
    for email, skill in rows:
        if email not in applicant_skills:
            applicant_skills[email] = []
        applicant_skills[email].append(skill)
    return applicant_skills

#Function to get all skills
def getskillnames():
    with connection.cursor() as cursor:
        cursor.execute("SELECT name FROM TRL_Skill")
        rows = cursor.fetchall()
    return [row[0] for row in rows]

#Function to filter applicants based on the id of the job in the table
def filterapplicant(job_id):
    # gets the desired skills from the specific job
    job_primary_skill, job_secondary_skill = getjob(job_id)
    job_skills = [job_primary_skill, job_secondary_skill]
    
    applicantemail = getapplicantemail()
    applicant_skills = getapplicantskills()
    listofskills = getskillnames()
    
    skill_matrix = []
    filtered_applicants = []
    
    # Create skill vectors for each applicant
    for applicant, submission_time in applicantemail:
        skillvector = [1 if skill in applicant_skills.get(applicant, []) else 0 for skill in listofskills]
        if any(skill in job_skills for skill in applicant_skills.get(applicant, [])):
            skill_matrix.append((skillvector, submission_time))
            filtered_applicants.append(applicant)
    job_vector = [1 if skill in job_skills else 0 for skill in listofskills]
    
    #calculates similarity scores between job skill and applicant skill vectors
    similarity_scores = [(cosine_similarity(skillvector, job_vector), submission_time) for skillvector, submission_time in skill_matrix]
    
    both_skills = []
    one_skill = []

    for i, (score, submission_time) in enumerate(similarity_scores):
        matching_skills = sum(1 for skill in job_skills if skill in applicant_skills.get(filtered_applicants[i], []))
        if matching_skills == 2:
            both_skills.append((filtered_applicants[i], score, submission_time))
        else:
            one_skill.append((filtered_applicants[i], score, submission_time))
    
    # Stack operations for both_skills
    main_stack_both_skills = []
    temp_stack_both_skills = []
    
    for applicant, score, submission_time in both_skills:
        while main_stack_both_skills and main_stack_both_skills[-1][2] > submission_time:
            temp_stack_both_skills.append(main_stack_both_skills.pop())
        main_stack_both_skills.append((applicant, score, submission_time))
        while temp_stack_both_skills:
            main_stack_both_skills.append(temp_stack_both_skills.pop())
    
    # Stack operations for one_skill
    main_stack_one_skill = []
    temp_stack_one_skill = []
    
    for applicant, score, submission_time in one_skill:
        while main_stack_one_skill and main_stack_one_skill[-1][2] > submission_time:
            temp_stack_one_skill.append(main_stack_one_skill.pop())
        main_stack_one_skill.append((applicant, score, submission_time))
        while temp_stack_one_skill:
            main_stack_one_skill.append(temp_stack_one_skill.pop())
    
    # Get recommended applicants
    recommended_applicants_both_skills = [applicant for applicant, _, _ in main_stack_both_skills]
    recommended_applicants_one_skill = [applicant for applicant, _, _ in main_stack_one_skill]
    
    return recommended_applicants_both_skills, recommended_applicants_one_skill