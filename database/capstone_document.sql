-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 12, 2024 at 01:02 PM
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
  `education_points` varchar(11) DEFAULT NULL,
  `final_essay` text DEFAULT NULL,
  `certificate_file_sub_professional` varchar(255) DEFAULT NULL,
  `certificate_file_technical_nc` varchar(255) DEFAULT NULL,
  `certificate_file_professional_prc_csc` varchar(255) DEFAULT NULL,
  `csc_points` varchar(11) DEFAULT NULL,
  `nc_points` varchar(11) DEFAULT NULL,
  `prc_points` varchar(11) DEFAULT NULL,
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
  `firstname` varchar(255) DEFAULT NULL,
  `middlename` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `birthday` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phonenumber` varchar(20) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `username` varchar(45) DEFAULT NULL,
  `password` varchar(60) NOT NULL,
  `profile_url` varchar(255) DEFAULT 'default.jpg',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `modified_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `award`
--

CREATE TABLE `award` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `award_level` varchar(255) DEFAULT NULL,
  `certificate_file_award` varchar(255) DEFAULT NULL,
  `points` varchar(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `author` varchar(255) NOT NULL DEFAULT 'Administrator',
  `text` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
  `award_points` int(11) DEFAULT NULL,
  `interview_chief_points` int(11) DEFAULT NULL,
  `interview_assessor_points` int(11) DEFAULT NULL,
  `total_score` int(11) GENERATED ALWAYS AS (`educational_points` + `work_experience_points` + `training_points` + `professional_development_points` + `eligibility_points` + `interview_chief_points` + `interview_assessor_points` + `award_points`) STORED,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_history`
--

CREATE TABLE `evaluation_history` (
  `id` int(11) NOT NULL,
  `assessor_id` varchar(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `education_points` int(11) DEFAULT NULL,
  `work_experience_points` varchar(255) DEFAULT NULL,
  `training_points` varchar(255) DEFAULT NULL,
  `professional_development_points` varchar(255) DEFAULT NULL,
  `award_points` varchar(255) DEFAULT NULL,
  `eligibility_points` varchar(255) DEFAULT NULL,
  `interview_chief_points` int(11) DEFAULT NULL,
  `interview_assessor_points` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
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
  `interview_date` date DEFAULT NULL,
  `interview_time` time DEFAULT NULL,
  `status` enum('Pending','Completed','Rejected','Accepted','Cancelled') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `professional_development`
--

CREATE TABLE `professional_development` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `professional_dev_level` varchar(255) DEFAULT NULL,
  `organization_dev` varchar(255) DEFAULT NULL,
  `description_dev` text DEFAULT NULL,
  `certificate_file_dev` varchar(255) DEFAULT NULL,
  `points` varchar(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `training`
--

CREATE TABLE `training` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `training_level` varchar(255) DEFAULT NULL,
  `training_title` varchar(255) DEFAULT NULL,
  `training_sponsor` varchar(255) DEFAULT NULL,
  `training_date` varchar(255) DEFAULT NULL,
  `training_certificate` varchar(255) DEFAULT NULL,
  `points` varchar(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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

-- --------------------------------------------------------

--
-- Table structure for table `work_experience`
--

CREATE TABLE `work_experience` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `job_title` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `company_address` varchar(255) DEFAULT NULL,
  `date_started_end` varchar(255) DEFAULT NULL,
  `employment_file` varchar(255) DEFAULT NULL,
  `points` varchar(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
  ADD KEY `application_assessors_ibfk_2` (`assessor_id`);

--
-- Indexes for table `assessor`
--
ALTER TABLE `assessor`
  ADD PRIMARY KEY (`assessor_id`),
  ADD UNIQUE KEY `email` (`email`,`phonenumber`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `uuid` (`uuid`);

--
-- Indexes for table `award`
--
ALTER TABLE `award`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`);

--
-- Indexes for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `evaluations_ibfk_1` (`application_id`),
  ADD KEY `evaluations_ibfk_2` (`assessor_id`);

--
-- Indexes for table `evaluation_history`
--
ALTER TABLE `evaluation_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `evaluation_history_ibfk_1` (`application_id`),
  ADD KEY `evaluation_history_ibfk_2` (`assessor_id`);

--
-- Indexes for table `interviews`
--
ALTER TABLE `interviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `application_id` (`application_id`);

--
-- Indexes for table `professional_development`
--
ALTER TABLE `professional_development`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`);

--
-- Indexes for table `training`
--
ALTER TABLE `training`
  ADD PRIMARY KEY (`id`),
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
-- Indexes for table `work_experience`
--
ALTER TABLE `work_experience`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`);

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
-- AUTO_INCREMENT for table `award`
--
ALTER TABLE `award`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluation_history`
--
ALTER TABLE `evaluation_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interviews`
--
ALTER TABLE `interviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `professional_development`
--
ALTER TABLE `professional_development`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `training`
--
ALTER TABLE `training`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `work_experience`
--
ALTER TABLE `work_experience`
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
  ADD CONSTRAINT `application_assessors_ibfk_2` FOREIGN KEY (`assessor_id`) REFERENCES `assessor` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `award`
--
ALTER TABLE `award`
  ADD CONSTRAINT `award_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`);

--
-- Constraints for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `application_assessors` (`application_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evaluations_ibfk_2` FOREIGN KEY (`assessor_id`) REFERENCES `application_assessors` (`assessor_id`) ON DELETE CASCADE;

--
-- Constraints for table `evaluation_history`
--
ALTER TABLE `evaluation_history`
  ADD CONSTRAINT `evaluation_history_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `application_assessors` (`application_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evaluation_history_ibfk_2` FOREIGN KEY (`assessor_id`) REFERENCES `application_assessors` (`assessor_id`) ON DELETE CASCADE;

--
-- Constraints for table `interviews`
--
ALTER TABLE `interviews`
  ADD CONSTRAINT `interviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`uuid`),
  ADD CONSTRAINT `interviews_ibfk_2` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`);

--
-- Constraints for table `professional_development`
--
ALTER TABLE `professional_development`
  ADD CONSTRAINT `professional_development_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `training`
--
ALTER TABLE `training`
  ADD CONSTRAINT `training_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `work_experience`
--
ALTER TABLE `work_experience`
  ADD CONSTRAINT `work_experience_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
