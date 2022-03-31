# CSYE6225 Assignment 

**Name**  - Sujaykumaran Palanikumar Sankarapandian<br/>
**NUID**  - 002108932<br/>
**Email** - palanikumarsankara.s@northeastern.edu   

## Description:

This NodeJS application returns 200 status code when the '/healthz' URL is called. <br/>
The user can Sign up with their details using the '/v1/user' endpoint. <br/>
Authenticated Users can view and Update their account information using 'v1/user/self' Endpoint. <br/>
The user can add/update/delete their Profile image using the 'v1/user/self/pic' Endpoint. 

## Instructions to Run the Application:

1. The application will run in 'http://demo.sujays.me'.
2. Hit the 'http://demo.sujays.me/healthz' URL in Postman. This will return the 200 OK Status.
3. Add User Account by providing First Name, Last Name, Username and Password in a Json format, by posting to 'http://demo.sujays.me/v1/user' endpoint.
4. Authenticate the User by using Postman Basic Auth.
5. View the User Account Details by hitting the 'http://demo.sujays.me/v1/user/self'. This will return error if user is not authenticated.
6.  The Authenticated User details can be updated by PUT request to the same endpoint.
7.  Update a profile image to a user by using 'http://demo.sujays.me/v1/user/self/pic'. This will return error if user is not authenticated. 