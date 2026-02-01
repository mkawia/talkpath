# HerbAtlass

TalkPath is powerful app to help stroke patients with aphasia communicate better.

## To run the sveltekit app in dev

npm run dev


## set up database

create database talkpath_db;
create user talkpath_app with encrypted password '123456';
grant all privileges on database talkpath_db to talkpath_app;

//this actually grants them all privileges on the database, in systems like debian; really sucks
GRANT ALL ON SCHEMA public TO talkpath_app;

