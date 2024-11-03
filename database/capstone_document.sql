-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 23, 2024 at 01:11 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `capstone_document`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `username` varchar(60) NOT NULL,
  `password` varchar(60) NOT NULL,
  `phoneNumber` varchar(60) NOT NULL,
  `joinDate` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `username`, `password`, `phoneNumber`, `joinDate`) VALUES
(1, 'admin', '$2a$12$/8U.U7tvawLLfi8wkK2/cOhRKYAfbaQ37/3t06WEdSymQ0hVIa3qK', '0912341223', '2024-04-21 17:49:45');

-- --------------------------------------------------------

--
-- Table structure for table `application`
--

CREATE TABLE `application` (
  `id` int(11) NOT NULL,
  `uuid` varchar(36) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `phonenumber` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `birthplace` varchar(255) DEFAULT NULL,
  `civil_status` varchar(20) DEFAULT NULL,
  `sex` varchar(10) DEFAULT NULL,
  `nationality` varchar(50) DEFAULT NULL,
  `languages` varchar(100) DEFAULT NULL,
  `first_priority` varchar(100) DEFAULT NULL,
  `second_priority` varchar(100) DEFAULT NULL,
  `third_priority` varchar(100) DEFAULT NULL,
  `cost_accreditation` varchar(255) DEFAULT NULL,
  `time_commitment` varchar(255) DEFAULT NULL,
  `hobbies_leisure` varchar(255) NOT NULL,
  `special_skills` varchar(255) NOT NULL,
  `work_related_activities` varchar(255) NOT NULL,
  `volunteer_activities` varchar(255) NOT NULL,
  `travels` varchar(255) NOT NULL,
  `qualification` varchar(100) DEFAULT NULL,
  `school_name` varchar(255) DEFAULT NULL,
  `school_address` varchar(255) DEFAULT NULL,
  `date_first_attended` date DEFAULT NULL,
  `date_last_attended` date DEFAULT NULL,
  `tor_file` varchar(255) DEFAULT NULL,
  `job_title` varchar(100) DEFAULT NULL,
  `company_name_ordinary` varchar(255) DEFAULT NULL,
  `company_address_ordinary` varchar(255) DEFAULT NULL,
  `date_started_work_ordinary` date DEFAULT NULL,
  `date_ended_work_ordinary` date DEFAULT NULL,
  `employment_file_ordinary` varchar(255) DEFAULT NULL,
  `company_name_supervisor` varchar(255) DEFAULT NULL,
  `company_address_supervisor` varchar(255) DEFAULT NULL,
  `date_started_work_supervisor` date DEFAULT NULL,
  `date_ended_work_supervisor` date DEFAULT NULL,
  `employment_file_supervisor` varchar(255) DEFAULT NULL,
  `company_name_manager` varchar(255) DEFAULT NULL,
  `company_address_manager` varchar(255) DEFAULT NULL,
  `date_started_work_manager` date DEFAULT NULL,
  `date_ended_work_manager` date DEFAULT NULL,
  `employment_file_manager` varchar(255) DEFAULT NULL,
  `training_level` varchar(50) DEFAULT NULL,
  `title_local` varchar(100) DEFAULT NULL,
  `organization_local` varchar(100) DEFAULT NULL,
  `date_local` date DEFAULT NULL,
  `title_national` varchar(100) DEFAULT NULL,
  `organization_national` varchar(100) DEFAULT NULL,
  `date_national` date DEFAULT NULL,
  `title_international` varchar(100) DEFAULT NULL,
  `organization_international` varchar(100) DEFAULT NULL,
  `date_international` date DEFAULT NULL,
  `professional_dev_level` varchar(50) DEFAULT NULL,
  `organization_local_dev` varchar(100) DEFAULT NULL,
  `description_local_dev` text DEFAULT NULL,
  `organization_national_dev` varchar(100) DEFAULT NULL,
  `description_national_dev` text DEFAULT NULL,
  `organization_international_dev` varchar(100) DEFAULT NULL,
  `description_international_dev` text DEFAULT NULL,
  `eligibility` varchar(100) DEFAULT NULL,
  `award_level` varchar(100) DEFAULT NULL,
  `final_essay` text DEFAULT NULL,
  `certificate_file_local` varchar(255) DEFAULT NULL,
  `certificate_file_national` varchar(255) DEFAULT NULL,
  `certificate_file_international` varchar(255) DEFAULT NULL,
  `certificate_file_local_dev` varchar(255) DEFAULT NULL,
  `certificate_file_national_dev` varchar(255) DEFAULT NULL,
  `certificate_file_international_dev` varchar(255) DEFAULT NULL,
  `certificate_file_sub_professional` varchar(255) DEFAULT NULL,
  `certificate_file_technical_nc` varchar(255) DEFAULT NULL,
  `certificate_file_professional_prc_csc` varchar(255) DEFAULT NULL,
  `certificate_file_local_regional` varchar(255) DEFAULT NULL,
  `certificate_file_national_international` varchar(255) DEFAULT NULL,
  `status` enum('Pending','Under Review','Additional Information Requested','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `application_assessors`
--

CREATE TABLE `application_assessors` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `assessor_id` varchar(11) NOT NULL,
  `status` enum('Pending','Evaluated') NOT NULL DEFAULT 'Pending',
  `assigned_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assessor`
--

CREATE TABLE `assessor` (
  `assessor_id` int(11) NOT NULL,
  `uuid` varchar(50) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `middlename` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `birthday` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phonenumber` varchar(20) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` varchar(60) NOT NULL,
  `profile_url` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `modified_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluations`
--

CREATE TABLE `evaluations` (
  `id` int(11) NOT NULL,
  `assessor_id` varchar(255) NOT NULL,
  `application_id` int(11) NOT NULL,
  `educational_points` int(11) DEFAULT NULL,
  `work_experience_points` int(11) DEFAULT NULL,
  `training_points` int(11) DEFAULT NULL,
  `professional_development_points` int(11) DEFAULT NULL,
  `eligibility_points` int(11) DEFAULT NULL,
  `interview_chief_points` int(11) DEFAULT NULL,
  `interview_assessor_points` int(11) DEFAULT NULL,
  `total_score` int(11) GENERATED ALWAYS AS (`educational_points` + `work_experience_points` + `training_points` + `professional_development_points` + `eligibility_points` + `interview_chief_points` + `interview_assessor_points`) STORED,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interviews`
--

CREATE TABLE `interviews` (
  `id` int(11) NOT NULL,
  `user_id` varchar(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `interview_date` date NOT NULL,
  `interview_time` time NOT NULL,
  `status` enum('Pending','Completed','Rejected','Accepted','Cancelled') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `uuid` varchar(50) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `middlename` varchar(255) DEFAULT NULL,
  `phonenumber` varchar(200) NOT NULL,
  `email` varchar(255) NOT NULL,
  `birthday` varchar(255) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` varchar(60) NOT NULL,
  `profile_url` varchar(60) DEFAULT NULL,
  `is_verified` tinyint(4) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `modified_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `resetPasswordToken` varchar(255) DEFAULT NULL,
  `resetPasswordExpires` bigint(20) DEFAULT NULL,
  `verification_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `application`
--
ALTER TABLE `application`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phonenumber` (`phonenumber`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `uuid` (`uuid`);

--
-- Indexes for table `application_assessors`
--
ALTER TABLE `application_assessors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`),
  ADD KEY `assessor_id` (`assessor_id`);

--
-- Indexes for table `assessor`
--
ALTER TABLE `assessor`
  ADD PRIMARY KEY (`assessor_id`),
  ADD UNIQUE KEY `email` (`email`,`phonenumber`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `uuid` (`uuid`);

--
-- Indexes for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`),
  ADD KEY `evaluations_ibfk_1` (`assessor_id`);

--
-- Indexes for table `interviews`
--
ALTER TABLE `interviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `application_id` (`application_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `phonenumber` (`phonenumber`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `application`
--
ALTER TABLE `application`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `application_assessors`
--
ALTER TABLE `application_assessors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assessor`
--
ALTER TABLE `assessor`
  MODIFY `assessor_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interviews`
--
ALTER TABLE `interviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `application`
--
ALTER TABLE `application`
  ADD CONSTRAINT `application_ibfk_1` FOREIGN KEY (`uuid`) REFERENCES `users` (`uuid`);

--
-- Constraints for table `application_assessors`
--
ALTER TABLE `application_assessors`
  ADD CONSTRAINT `application_assessors_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`),
  ADD CONSTRAINT `application_assessors_ibfk_2` FOREIGN KEY (`assessor_id`) REFERENCES `assessor` (`uuid`);

--
-- Constraints for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`assessor_id`) REFERENCES `assessor` (`uuid`),
  ADD CONSTRAINT `evaluations_ibfk_2` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`);

--
-- Constraints for table `interviews`
--
ALTER TABLE `interviews`
  ADD CONSTRAINT `interviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`uuid`),
  ADD CONSTRAINT `interviews_ibfk_2` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
