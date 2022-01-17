# aha_exam_backend

For [Frontend](ahaexamfe.herokuapp.com)

## Models 
contains app model : 
 - User model 
 - Token model
 - index for sequelize initiation 

## Controller
contains app controller
 - /login login to the app
 - /register register to the app with basic auth
 - /logout 
 - /token_verification basic auth verification
 - /resend resend verification
 - /auth/google : google auth callback
 - /auth/facebook : facebook auth callback
 - /seed : seed users
 - /user : get user dat
 
## helpers
contains app helpers
 - db for database helpers
 - validator for password validator
 - bcrypt for password hashing
 - jwt for access token generation and verification
 - mailer for sending email
 
## middleware
contains app middleware
 - app authentication for every request
 - error handler
 
## routes
contains app routes
 
