drop database if exists employee_tracker_db;
create database employee_tracker_db;
use employee_tracker_db;

-- department table
create table department (
id int auto_increment not null,
name varchar(30),
primary key(id));

-- role table
create table role (
id int auto_increment not null,
title varchar(30),
salary decimal(10,2),
department_id int,
foreign key (department_id) references department(id),
primary key(id));

-- employee table
create table employee (
id int auto_increment not null,
first_name varchar(30),
last_name varchar(30),
role_id int ,
is_manager  boolean default false,
manager_id int default null,
foreign key (role_id) references role(id),
primary key(id));