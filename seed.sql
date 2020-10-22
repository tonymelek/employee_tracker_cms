drop database if exists emplyoyee_tracker_db;
create database emplyoyee_tracker_db;
use emplyoyee_tracker_db;
create table employee (
id int auto_increment not null,
first_name varchar(30),
last_name varchar(30),
role_id int ,
is_manager  boolean default false,
manager_id int default null,
primary key(id));

create table department (
id int auto_increment not null,
name varchar(30),
primary key(id));

create table role (
id int auto_increment not null,
title varchar(30),
salary decimal(10,2),
department_id int,
primary key(id));