# CSYE6225 Assignment 

**Name**  - Sujaykumaran Palanikumar Sankarapandian<br/>
**NUID**  - 002108932<br/>
**Email** - palanikumarsankara.s@northeastern.edu 

## Description:

The application returns 200 status code when the '/healthz' URL is called. 
The user can Sign up with their details using the '/v1/user' endpoint.
Authenticated Users can view and Update their account information using 'v1/user/self' Endpoint.

## Instructions to Run the Application:

1. Clone the repository using the 'git clone' command.
2. Import the Application folder in your preferred IDE.
3. Install the dependencies using the 'npm install' command.
4. Enter the credentials for MySQL DB in the Config file under "app/config" folder.
5. Run the application using the 'npm start' command. The application will run in 'http://localhost:3000'.
6. Hit the 'http://localhost:3000/healthz' URL in Postman. This will return the 200 OK Status.
7. Add User Account by providing First Name, Last Name, Username and Password in a Json format, by posting to 'http://localhost:3000/v1/user' endpoint.
8. Authenticate the User by using Postman Basic Auth.
9. View the User Account Details by hitting the 'http://localhost:3000/v1/user/self'. This will return error if user is not authenticated.
10. The Authenticated User details can be updated by PUT request to the same endpoint.
11. Run the 'npm test' command to run the unit tests for the application.