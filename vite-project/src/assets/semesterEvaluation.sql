-- Adminer 4.8.1 MySQL 8.4.1 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

CREATE DATABASE `semesterEvaluation` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `semesterEvaluation`;

CREATE TABLE `board_chairman_mapping` (
  `id` int NOT NULL AUTO_INCREMENT,
  `board` int NOT NULL,
  `chairman` int NOT NULL,
  `semcode` int NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `board` (`board`),
  KEY `chairman` (`chairman`),
  KEY `semcode` (`semcode`),
  CONSTRAINT `board_chairman_mapping_ibfk_1` FOREIGN KEY (`board`) REFERENCES `master_department` (`id`),
  CONSTRAINT `board_chairman_mapping_ibfk_3` FOREIGN KEY (`chairman`) REFERENCES `master_faculty` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `board_chairman_mapping_ibfk_4` FOREIGN KEY (`semcode`) REFERENCES `master_semcode` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `board_chairman_mapping` (`id`, `board`, `chairman`, `semcode`, `status`) VALUES
(1,	1,	46,	46,	'1');

CREATE TABLE `board_chief_examiner_mapping` (
  `id` int NOT NULL AUTO_INCREMENT,
  `board` int NOT NULL,
  `faculty` int NOT NULL,
  `semcode` int NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `board` (`board`),
  KEY `faculty` (`faculty`),
  KEY `semcode` (`semcode`),
  CONSTRAINT `board_chief_examiner_mapping_ibfk_1` FOREIGN KEY (`board`) REFERENCES `master_department` (`id`),
  CONSTRAINT `board_chief_examiner_mapping_ibfk_2` FOREIGN KEY (`faculty`) REFERENCES `master_faculty` (`id`),
  CONSTRAINT `board_chief_examiner_mapping_ibfk_3` FOREIGN KEY (`semcode`) REFERENCES `master_semcode` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `board_chief_examiner_mapping` (`id`, `board`, `faculty`, `semcode`, `status`) VALUES
(1,	1,	51,	46,	'1'),
(2,	1,	47,	46,	'1');

CREATE TABLE `board_course_mapping` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department` int NOT NULL,
  `course` int NOT NULL,
  `paper_count` int NOT NULL,
  `semcode` int NOT NULL,
  `time_in_days` int NOT NULL DEFAULT '2',
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `department` (`department`),
  KEY `course` (`course`),
  KEY `semcode` (`semcode`),
  CONSTRAINT `board_course_mapping_ibfk_1` FOREIGN KEY (`department`) REFERENCES `master_department` (`id`),
  CONSTRAINT `board_course_mapping_ibfk_2` FOREIGN KEY (`course`) REFERENCES `master_courses` (`id`),
  CONSTRAINT `board_course_mapping_ibfk_3` FOREIGN KEY (`semcode`) REFERENCES `master_semcode` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `board_course_mapping` (`id`, `department`, `course`, `paper_count`, `semcode`, `time_in_days`, `status`) VALUES
(13,	1,	20,	189,	46,	2,	'1'),
(14,	1,	29,	189,	46,	2,	'1'),
(15,	1,	33,	189,	46,	2,	'1'),
(16,	1,	38,	189,	46,	2,	'1'),
(17,	1,	39,	189,	46,	2,	'1'),
(18,	1,	42,	189,	46,	2,	'1'),
(19,	1,	21,	189,	46,	2,	'1'),
(20,	1,	22,	189,	46,	2,	'1'),
(21,	1,	23,	189,	46,	2,	'1'),
(22,	1,	24,	189,	46,	2,	'1'),
(23,	1,	25,	189,	46,	2,	'1'),
(24,	1,	28,	189,	46,	2,	'1'),
(25,	1,	32,	189,	46,	2,	'1'),
(26,	1,	34,	189,	46,	2,	'1'),
(27,	1,	35,	189,	46,	2,	'1'),
(28,	1,	36,	189,	46,	2,	'1'),
(29,	1,	37,	50,	46,	2,	'1'),
(30,	1,	40,	189,	46,	2,	'1'),
(31,	1,	43,	189,	46,	2,	'1'),
(32,	1,	45,	189,	46,	2,	'1'),
(33,	1,	46,	189,	46,	2,	'1'),
(34,	1,	50,	189,	46,	2,	'1'),
(35,	1,	19,	189,	46,	2,	'1'),
(36,	1,	26,	189,	46,	2,	'1'),
(37,	1,	27,	189,	46,	2,	'1'),
(38,	1,	30,	189,	46,	2,	'1'),
(39,	1,	31,	189,	46,	2,	'1'),
(40,	1,	41,	189,	46,	2,	'1'),
(41,	1,	44,	189,	46,	2,	'1'),
(42,	1,	47,	189,	46,	2,	'1'),
(43,	1,	48,	189,	46,	2,	'1'),
(44,	1,	49,	189,	46,	2,	'1');

CREATE TABLE `eligible_faculty` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faculty` int NOT NULL,
  `semcode` int NOT NULL,
  `department` int NOT NULL,
  `enum` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `faculty` (`faculty`),
  KEY `department` (`department`),
  KEY `semcode` (`semcode`),
  CONSTRAINT `eligible_faculty_ibfk_2` FOREIGN KEY (`faculty`) REFERENCES `master_faculty` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `eligible_faculty_ibfk_3` FOREIGN KEY (`department`) REFERENCES `master_department` (`id`),
  CONSTRAINT `eligible_faculty_ibfk_4` FOREIGN KEY (`semcode`) REFERENCES `master_semcode` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `eligible_faculty` (`id`, `faculty`, `semcode`, `department`, `enum`) VALUES
(2004,	46,	46,	1,	'1'),
(2005,	47,	46,	1,	'1'),
(2006,	48,	46,	1,	'1'),
(2007,	49,	46,	1,	'1'),
(2008,	49,	46,	1,	'1'),
(2009,	51,	46,	1,	'1'),
(2010,	51,	46,	1,	'1'),
(2011,	53,	46,	1,	'1'),
(2012,	54,	46,	1,	'1'),
(2013,	54,	46,	1,	'1'),
(2014,	54,	46,	1,	'1'),
(2015,	57,	46,	1,	'1'),
(2016,	57,	46,	1,	'1'),
(2017,	57,	46,	1,	'1'),
(2018,	57,	46,	1,	'1'),
(2019,	61,	46,	1,	'1'),
(2020,	61,	46,	1,	'1'),
(2021,	61,	46,	1,	'1'),
(2022,	64,	46,	1,	'1'),
(2023,	64,	46,	1,	'1'),
(2024,	64,	46,	1,	'1'),
(2025,	67,	46,	1,	'1'),
(2026,	67,	46,	1,	'1'),
(2027,	67,	46,	1,	'1'),
(2028,	70,	46,	1,	'1'),
(2029,	70,	46,	1,	'1'),
(2030,	70,	46,	1,	'1'),
(2031,	73,	46,	1,	'1'),
(2032,	73,	46,	1,	'1'),
(2033,	75,	46,	1,	'1'),
(2034,	75,	46,	1,	'1'),
(2035,	75,	46,	1,	'1'),
(2036,	78,	46,	1,	'1'),
(2037,	78,	46,	1,	'1'),
(2038,	78,	46,	1,	'1'),
(2039,	81,	46,	1,	'1'),
(2040,	82,	46,	1,	'1'),
(2041,	82,	46,	1,	'1'),
(2042,	84,	46,	1,	'1'),
(2043,	85,	46,	1,	'1'),
(2044,	85,	46,	1,	'1'),
(2045,	85,	46,	1,	'1'),
(2046,	88,	46,	1,	'1'),
(2047,	88,	46,	1,	'1'),
(2048,	90,	46,	1,	'1'),
(2049,	91,	46,	1,	'1'),
(2050,	92,	46,	1,	'1'),
(2051,	93,	46,	1,	'1'),
(2052,	93,	46,	1,	'1'),
(2053,	95,	46,	1,	'1');

CREATE TABLE `external_faculty` (
  `id` int NOT NULL AUTO_INCREMENT,
  `facultyId` varchar(255) NOT NULL,
  `facultyName` varchar(255) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `external_faculty` (`id`, `facultyId`, `facultyName`, `status`) VALUES
(1,	'CS000',	'Kumar',	'1');

CREATE TABLE `external_faculty_paper_allocation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faculty` int NOT NULL,
  `semcode` int NOT NULL,
  `course` int NOT NULL,
  `paper_count` int NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `faculty` (`faculty`),
  KEY `semcode` (`semcode`),
  KEY `course` (`course`),
  CONSTRAINT `external_faculty_paper_allocation_ibfk_1` FOREIGN KEY (`faculty`) REFERENCES `external_faculty` (`id`),
  CONSTRAINT `external_faculty_paper_allocation_ibfk_2` FOREIGN KEY (`semcode`) REFERENCES `master_semcode` (`id`),
  CONSTRAINT `external_faculty_paper_allocation_ibfk_3` FOREIGN KEY (`course`) REFERENCES `master_courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `external_faculty_paper_allocation` (`id`, `faculty`, `semcode`, `course`, `paper_count`, `status`) VALUES
(1,	1,	46,	38,	50,	'1');

CREATE TABLE `faculty_change_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `old_faculty` int NOT NULL,
  `new_faculty` int NOT NULL,
  `course` int NOT NULL,
  `semcode` int NOT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `status` enum('-2','-1','0','1','2') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `faculty` (`new_faculty`),
  KEY `course` (`course`),
  KEY `semcode` (`semcode`),
  KEY `old_faculty` (`old_faculty`),
  CONSTRAINT `faculty_change_requests_ibfk_1` FOREIGN KEY (`new_faculty`) REFERENCES `master_faculty` (`id`),
  CONSTRAINT `faculty_change_requests_ibfk_2` FOREIGN KEY (`course`) REFERENCES `master_courses` (`id`),
  CONSTRAINT `faculty_change_requests_ibfk_3` FOREIGN KEY (`semcode`) REFERENCES `master_semcode` (`id`),
  CONSTRAINT `faculty_change_requests_ibfk_4` FOREIGN KEY (`old_faculty`) REFERENCES `master_faculty` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `faculty_course_mapping` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faculty` int NOT NULL,
  `course` int NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `faculty` (`faculty`),
  KEY `course` (`course`),
  CONSTRAINT `faculty_course_mapping_ibfk_1` FOREIGN KEY (`faculty`) REFERENCES `master_faculty` (`id`),
  CONSTRAINT `faculty_course_mapping_ibfk_2` FOREIGN KEY (`course`) REFERENCES `master_courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `faculty_course_mapping` (`id`, `faculty`, `course`, `status`) VALUES
(201,	46,	19,	'1'),
(202,	47,	19,	'1'),
(203,	48,	20,	'1'),
(204,	49,	22,	'1'),
(205,	49,	21,	'1'),
(206,	50,	22,	'1'),
(207,	50,	21,	'1'),
(208,	51,	24,	'1'),
(209,	51,	23,	'1'),
(210,	52,	24,	'1'),
(211,	52,	23,	'1'),
(212,	53,	25,	'1'),
(213,	54,	28,	'1'),
(214,	54,	27,	'1'),
(215,	54,	26,	'1'),
(216,	55,	28,	'1'),
(217,	55,	27,	'1'),
(218,	55,	26,	'1'),
(219,	56,	28,	'1'),
(220,	56,	27,	'1'),
(221,	56,	26,	'1'),
(222,	57,	30,	'1'),
(223,	57,	29,	'1'),
(224,	57,	28,	'1'),
(225,	58,	30,	'1'),
(226,	58,	29,	'1'),
(227,	58,	28,	'1'),
(228,	59,	30,	'1'),
(229,	59,	29,	'1'),
(230,	59,	28,	'1'),
(231,	60,	30,	'1'),
(232,	60,	29,	'1'),
(233,	60,	28,	'1'),
(234,	61,	31,	'1'),
(235,	61,	30,	'1'),
(236,	61,	28,	'1'),
(237,	62,	31,	'1'),
(238,	62,	30,	'1'),
(239,	62,	28,	'1'),
(240,	63,	31,	'1'),
(241,	63,	30,	'1'),
(242,	63,	28,	'1'),
(243,	64,	32,	'1'),
(244,	64,	29,	'1'),
(245,	64,	25,	'1'),
(246,	65,	32,	'1'),
(247,	65,	29,	'1'),
(248,	65,	25,	'1'),
(249,	66,	32,	'1'),
(250,	66,	29,	'1'),
(251,	66,	25,	'1'),
(252,	67,	35,	'1'),
(253,	67,	34,	'1'),
(254,	67,	33,	'1'),
(255,	68,	35,	'1'),
(256,	68,	34,	'1'),
(257,	68,	33,	'1'),
(258,	69,	35,	'1'),
(259,	69,	34,	'1'),
(260,	69,	33,	'1'),
(261,	70,	36,	'1'),
(262,	70,	22,	'1'),
(263,	70,	21,	'1'),
(264,	71,	36,	'1'),
(265,	71,	22,	'1'),
(266,	71,	21,	'1'),
(267,	72,	36,	'1'),
(268,	72,	22,	'1'),
(269,	72,	21,	'1'),
(270,	75,	39,	'1'),
(271,	75,	38,	'1'),
(272,	75,	37,	'1'),
(273,	76,	39,	'1'),
(274,	76,	38,	'1'),
(275,	76,	37,	'1'),
(276,	77,	39,	'1'),
(277,	77,	38,	'1'),
(278,	77,	37,	'1'),
(279,	78,	40,	'1'),
(280,	78,	31,	'1'),
(281,	78,	30,	'1'),
(282,	79,	40,	'1'),
(283,	79,	31,	'1'),
(284,	79,	30,	'1'),
(285,	80,	40,	'1'),
(286,	80,	31,	'1'),
(287,	80,	30,	'1'),
(288,	81,	19,	'1'),
(289,	85,	41,	'1'),
(290,	85,	25,	'1'),
(291,	86,	41,	'1'),
(292,	86,	25,	'1'),
(293,	87,	41,	'1'),
(294,	87,	25,	'1'),
(295,	88,	41,	'1'),
(296,	88,	40,	'1'),
(297,	89,	41,	'1'),
(298,	89,	40,	'1'),
(299,	90,	42,	'1'),
(300,	91,	42,	'1'),
(301,	92,	43,	'1'),
(302,	93,	24,	'1'),
(303,	93,	23,	'1'),
(304,	94,	24,	'1'),
(305,	94,	23,	'1'),
(306,	95,	31,	'1'),
(307,	96,	44,	'1'),
(308,	96,	22,	'1'),
(309,	96,	21,	'1'),
(310,	97,	44,	'1'),
(311,	97,	22,	'1'),
(312,	97,	21,	'1'),
(313,	98,	44,	'1'),
(314,	98,	22,	'1'),
(315,	98,	21,	'1'),
(316,	99,	46,	'1'),
(317,	99,	45,	'1'),
(318,	100,	46,	'1'),
(319,	100,	45,	'1'),
(320,	101,	46,	'1'),
(321,	101,	45,	'1'),
(322,	102,	46,	'1'),
(323,	102,	45,	'1'),
(324,	126,	19,	'1');

CREATE TABLE `faculty_paper_allocation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faculty` int NOT NULL,
  `course` int NOT NULL,
  `paper_count` int NOT NULL,
  `semcode` int NOT NULL,
  `handlingFaculty` int NOT NULL,
  `status` enum('-5','-4','-3','-2','-1','0','1','2') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '0',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `faculty` (`faculty`),
  KEY `course` (`course`),
  KEY `semcode` (`semcode`),
  KEY `handlingFaculty` (`handlingFaculty`),
  CONSTRAINT `faculty_paper_allocation_ibfk_1` FOREIGN KEY (`faculty`) REFERENCES `master_faculty` (`id`),
  CONSTRAINT `faculty_paper_allocation_ibfk_2` FOREIGN KEY (`course`) REFERENCES `master_courses` (`id`),
  CONSTRAINT `faculty_paper_allocation_ibfk_3` FOREIGN KEY (`semcode`) REFERENCES `master_semcode` (`id`),
  CONSTRAINT `faculty_paper_allocation_ibfk_4` FOREIGN KEY (`handlingFaculty`) REFERENCES `master_faculty` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `faculty_paper_allocation` (`id`, `faculty`, `course`, `paper_count`, `semcode`, `handlingFaculty`, `status`, `remark`) VALUES
(306,	78,	31,	75,	46,	46,	'-2',	'ffrfrff'),
(307,	95,	31,	100,	46,	51,	'1',	NULL),
(308,	61,	31,	14,	46,	47,	'1',	'sddeded');

CREATE TABLE `master_batch` (
  `id` int NOT NULL AUTO_INCREMENT,
  `batch` varchar(255) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `master_batch` (`id`, `batch`, `status`) VALUES
(1,	'2022-2026',	'1'),
(2,	'2021-2025',	'1'),
(3,	'2019-2023',	'1'),
(4,	'2018-2022',	'1');

CREATE TABLE `master_coe` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faculty` int NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `faculty` (`faculty`),
  CONSTRAINT `master_coe_ibfk_1` FOREIGN KEY (`faculty`) REFERENCES `master_faculty` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `master_coe` (`id`, `faculty`, `status`) VALUES
(5,	126,	'1');

CREATE TABLE `master_courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_name` varchar(255) NOT NULL,
  `course_code` varchar(255) NOT NULL,
  `department` int NOT NULL,
  `semester` int NOT NULL,
  `regulation` int NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `semester` (`semester`),
  KEY `regulation` (`regulation`),
  KEY `department` (`department`),
  CONSTRAINT `master_courses_ibfk_1` FOREIGN KEY (`semester`) REFERENCES `master_semester` (`id`),
  CONSTRAINT `master_courses_ibfk_3` FOREIGN KEY (`regulation`) REFERENCES `master_regulation` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `master_courses_ibfk_4` FOREIGN KEY (`department`) REFERENCES `master_department` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `master_courses` (`id`, `course_name`, `course_code`, `department`, `semester`, `regulation`, `status`) VALUES
(19,	'COMPILER DESIGN',	'18CS603',	1,	6,	1,	'1'),
(20,	'DIGITAL SYSTEM DESIGN',	'19IS206',	4,	2,	1,	'1'),
(21,	'MICROPROCESSORS AND MICROCONTROLLER',	'18CS403',	1,	4,	1,	'1'),
(22,	'MICROPROCESSORS AND MICROCONTROLLER LABORATORY',	'18CS407',	1,	4,	1,	'1'),
(23,	'DATA MINING AND DATA WAREHOUSING',	'18CS405',	1,	4,	1,	'1'),
(24,	'DATA MINING AND DATA WAREHOUSING LABORATORY',	'18CS408',	1,	4,	1,	'1'),
(25,	'JAVA PROGRAMMING',	'18CS406',	1,	4,	1,	'1'),
(26,	'WEB TECHNOLOGY',	'18CS602',	1,	6,	1,	'1'),
(27,	'WEB TECHNOLOGY LABORATORY',	'18CS607',	1,	6,	1,	'1'),
(28,	'OPERATING SYSTEM',	'18CS404',	1,	4,	1,	'1'),
(29,	'COMPUTER PROGRAMMING II',	'18CS204',	1,	2,	1,	'1'),
(30,	'CLOUD COMPUTING LABORATORY',	'18CS608',	1,	6,	1,	'1'),
(31,	'CLOUD COMPUTING',	'18CS604',	1,	6,	1,	'1'),
(32,	'JAVA PROGRAMMING LABORATORY',	'19IS408',	4,	4,	1,	'1'),
(33,	'DIGITAL SYSTEM DESIGN',	'19CT206',	3,	2,	1,	'1'),
(34,	'OPERATING SYSTEMS',	'19IS403',	4,	4,	1,	'1'),
(35,	'OPERATING SYSTEMS LABORATORY',	'19IS407',	4,	4,	1,	'1'),
(36,	'THEORY OF COMPUTATION',	'19CT403',	3,	4,	1,	'1'),
(37,	'DESIGN AND ANALYSIS OF ALGORITHMS',	'18CS402',	1,	4,	1,	'1'),
(38,	'C PROGRAMMING',	'18MC204',	5,	2,	1,	'1'),
(39,	'COMPUTER PROGRAMMING II',	'18ME206',	6,	2,	1,	'1'),
(40,	'PYTHON PROGRAMMING',	'18EE406',	8,	4,	1,	'1'),
(41,	'OBJECT ORIENTED PROGRAMMING LABORATORY',	'18MC608',	5,	6,	1,	'1'),
(42,	'DIGITAL MARKETING',	'18CS020',	1,	2,	1,	'1'),
(43,	'SOFTWARE DESIGN WITH UML',	'19CB403',	7,	4,	1,	'1'),
(44,	'SECURITY IN COMPUTING',	'19CT603',	3,	6,	1,	'1'),
(45,	'MICROPROCESSORS AND MICROCONTROLLER',	'19CT405',	3,	4,	1,	'1'),
(46,	'MICROPROCESSORS AND MICROCONTROLLER LABORATORY',	'19CT407',	3,	4,	1,	'1'),
(47,	'INFORMATION SECURITY',	'19CB602',	7,	6,	1,	'1'),
(48,	'CLOUD INFRASTRUCTURE AND SERVICES',	'19IS603',	4,	6,	1,	'1'),
(49,	'CLOUD INFRASTRUCTURE AND SERVICES LABORATORY',	'19IS607',	4,	6,	1,	'1'),
(50,	'SOFTWARE ENGINEERING',	'19IS406',	4,	4,	1,	'1');

CREATE TABLE `master_department` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department` varchar(255) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `master_department` (`id`, `department`, `status`) VALUES
(1,	'CSE',	'1'),
(2,	'IT',	'1'),
(3,	'CT',	'1'),
(4,	'IS',	'1'),
(5,	'MC',	'1'),
(6,	'ME',	'1'),
(7,	'CB',	'1'),
(8,	'EE',	'1');

CREATE TABLE `master_faculty` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `faculty_id` varchar(255) NOT NULL,
  `department` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `experience_in_bit` int NOT NULL DEFAULT '0',
  `total_teaching_experience` int NOT NULL DEFAULT '0',
  `date_of_joining` date DEFAULT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `department` (`department`),
  CONSTRAINT `master_faculty_ibfk_1` FOREIGN KEY (`department`) REFERENCES `master_department` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `master_faculty` (`id`, `name`, `faculty_id`, `department`, `email`, `experience_in_bit`, `total_teaching_experience`, `date_of_joining`, `status`) VALUES
(46,	'Dr K.PREMALATHA',	'CS1618',	1,	'',	2,	5,	NULL,	'1'),
(47,	'Dr S.LOGESWARI',	'CS1019',	1,	'',	2,	5,	NULL,	'1'),
(48,	'Dr J.VIJAY FRANKLIN',	'CS1340',	1,	'',	2,	5,	NULL,	'1'),
(49,	'Dr R.GOMATHI',	'CS1444',	1,	'',	2,	5,	NULL,	'1'),
(50,	'Dr R.GOMATHI',	'CS1444',	1,	'',	2,	5,	NULL,	'1'),
(51,	'Dr P.SATHISHKUMAR',	'CS1362',	1,	'',	2,	5,	NULL,	'1'),
(52,	'Dr P.SATHISHKUMAR',	'CS1362',	1,	'',	2,	5,	NULL,	'1'),
(53,	'Mr K.SATHIS KUMAR',	'CS1764',	1,	'',	2,	5,	NULL,	'1'),
(54,	'Ms T.NAGAMANI',	'CS1767',	1,	'',	2,	5,	NULL,	'1'),
(55,	'Ms T.NAGAMANI',	'CS1767',	1,	'',	2,	5,	NULL,	'1'),
(56,	'Ms T.NAGAMANI',	'CS1767',	1,	'',	2,	5,	NULL,	'1'),
(57,	'Ms R.RAMYA',	'CS1906',	1,	'',	2,	5,	NULL,	'1'),
(58,	'Ms R.RAMYA',	'CS1906',	1,	'',	2,	5,	NULL,	'1'),
(59,	'Ms R.RAMYA',	'CS1906',	1,	'',	2,	5,	NULL,	'1'),
(60,	'Ms R.RAMYA',	'CS1906',	1,	'',	2,	5,	NULL,	'1'),
(61,	'Mr P.S DINESH',	'CS10025',	1,	'',	2,	5,	NULL,	'1'),
(62,	'Mr P.S DINESH',	'CS10025',	1,	'',	2,	5,	NULL,	'1'),
(63,	'Mr P.S DINESH',	'CS10025',	1,	'',	2,	5,	NULL,	'1'),
(64,	'Mr G.SATHISHKUMAR',	'CS10134',	1,	'',	2,	5,	NULL,	'1'),
(65,	'Mr G.SATHISHKUMAR',	'CS10134',	1,	'',	2,	5,	NULL,	'1'),
(66,	'Mr G.SATHISHKUMAR',	'CS10134',	1,	'',	2,	5,	NULL,	'1'),
(67,	'Dr S.NITHYANANDHAM',	'CS10762',	1,	'',	2,	5,	NULL,	'1'),
(68,	'Dr S.NITHYANANDHAM',	'CS10762',	1,	'',	2,	5,	NULL,	'1'),
(69,	'Dr S.NITHYANANDHAM',	'CS10762',	1,	'',	2,	5,	NULL,	'1'),
(70,	'Mr P.PARTHASARATHI',	'CS10787',	1,	'',	2,	5,	NULL,	'1'),
(71,	'Mr P.PARTHASARATHI',	'CS10787',	1,	'',	2,	5,	NULL,	'1'),
(72,	'Mr P.PARTHASARATHI',	'CS10787',	1,	'',	2,	5,	NULL,	'1'),
(73,	'Dr S.N SANGEETHA',	'CS10797',	1,	'',	2,	5,	NULL,	'1'),
(74,	'Dr S.N SANGEETHA',	'CS10797',	1,	'',	2,	5,	NULL,	'1'),
(75,	'Dr K.SARANYA',	'CS10906',	1,	'',	2,	5,	NULL,	'1'),
(76,	'Dr K.SARANYA',	'CS10906',	1,	'',	2,	5,	NULL,	'1'),
(77,	'Dr K.SARANYA',	'CS10906',	1,	'',	2,	5,	NULL,	'1'),
(78,	'Dr S.S RAJASEKAR',	'CS10907',	1,	'',	2,	5,	NULL,	'1'),
(79,	'Dr S.S RAJASEKAR',	'CS10907',	1,	'',	2,	5,	NULL,	'1'),
(80,	'Dr S.S RAJASEKAR',	'CS10907',	1,	'',	2,	5,	NULL,	'1'),
(81,	'Ms M.KARTHIGA',	'CS10239',	1,	'',	2,	5,	NULL,	'1'),
(82,	'Ms K.GANAGAVALLI',	'CS10268',	1,	'',	2,	5,	NULL,	'1'),
(83,	'Ms K.GANAGAVALLI',	'CS10268',	1,	'',	2,	5,	NULL,	'1'),
(84,	'Ms R.M THARSANEE',	'CS10436',	1,	'',	2,	5,	NULL,	'1'),
(85,	'Mr V.KRISNAMOORTHY',	'CS10519',	1,	'',	2,	5,	NULL,	'1'),
(86,	'Mr V.KRISNAMOORTHY',	'CS10519',	1,	'',	2,	5,	NULL,	'1'),
(87,	'Mr V.KRISNAMOORTHY',	'CS10519',	1,	'',	2,	5,	NULL,	'1'),
(88,	'Mr A.SARAN KUMAR',	'CS10521',	1,	'',	2,	5,	NULL,	'1'),
(89,	'Mr A.SARAN KUMAR',	'CS10521',	1,	'',	2,	5,	NULL,	'1'),
(90,	'Mr V.PRAVEEN',	'CS10538',	1,	'',	2,	5,	NULL,	'1'),
(91,	'Ms S.PRIYANKA',	'CS10646',	1,	'',	2,	5,	NULL,	'1'),
(92,	'Ms M.MEENAKSHI DHANALAKSHMI',	'CS10719',	1,	'',	2,	5,	NULL,	'1'),
(93,	'Dr R.SUGUNA',	'CS10753',	1,	'',	2,	5,	NULL,	'1'),
(94,	'Dr R.SUGUNA',	'CS10753',	1,	'',	2,	5,	NULL,	'1'),
(95,	'Mr B.MAGESHKUMAR',	'CS10767',	1,	'',	2,	5,	NULL,	'1'),
(96,	'Mr S.SUSEENDRAN',	'CS10776',	1,	'',	2,	5,	NULL,	'1'),
(97,	'Mr S.SUSEENDRAN',	'CS10776',	1,	'',	2,	5,	NULL,	'1'),
(98,	'Mr S.SUSEENDRAN',	'CS10776',	1,	'',	2,	5,	NULL,	'1'),
(99,	'Mr D.YUVARAJ',	'CS10784',	1,	'',	2,	5,	NULL,	'1'),
(100,	'Mr D.YUVARAJ',	'CS10784',	1,	'',	2,	5,	NULL,	'1'),
(101,	'Ms P.DHIVYA',	'CS10789',	1,	'',	2,	5,	NULL,	'1'),
(102,	'Ms P.DHIVYA',	'CS10789',	1,	'',	2,	5,	NULL,	'1'),
(103,	'Ms P.DIVYA',	'CS10794',	1,	'',	2,	5,	NULL,	'1'),
(104,	'Ms P.DIVYA',	'CS10794',	1,	'',	2,	5,	NULL,	'1'),
(105,	'Ms S.JOTHIMANI',	'CS10798',	1,	'',	2,	5,	NULL,	'1'),
(106,	'Ms P.R RUPASHINI',	'CS10804',	1,	'',	2,	5,	NULL,	'1'),
(107,	'Ms V.R KIRUTHIKA',	'CS10825',	1,	'',	2,	5,	NULL,	'1'),
(108,	'Ms PHILO SUMI',	'CS10839',	1,	'',	2,	5,	NULL,	'1'),
(109,	'Ms PHILO SUMI',	'CS10839',	1,	'',	2,	5,	NULL,	'1'),
(110,	'Ms R.NITHYA',	'CS10843',	1,	'',	2,	5,	NULL,	'1'),
(111,	'Ms N.SANGAVI',	'CS10861',	1,	'',	2,	5,	NULL,	'1'),
(112,	'Ms N.SANGAVI',	'CS10861',	1,	'',	2,	5,	NULL,	'1'),
(113,	'Ms R.JANAGI',	'CS10874',	1,	'',	2,	5,	NULL,	'1'),
(114,	'Ms R.JANAGI',	'CS10874',	1,	'',	2,	5,	NULL,	'1'),
(115,	'Mr T.MUNIRATHINAM',	'CS10875',	1,	'',	2,	5,	NULL,	'1'),
(116,	'Mr T.MUNIRATHINAM',	'CS10875',	1,	'',	2,	5,	NULL,	'1'),
(117,	'Mr R.SATHISHKANNAN',	'CS10876',	1,	'',	2,	5,	NULL,	'1'),
(118,	'Ms E.KALAIVANI',	'CS10880',	1,	'',	2,	5,	NULL,	'1'),
(119,	'Ms C.LAVANYA',	'CS10878',	1,	'',	2,	5,	NULL,	'1'),
(120,	'Ms C.LAVANYA',	'CS10878',	1,	'',	2,	5,	NULL,	'1'),
(121,	'Mr M.HARI BALAJI',	'CS10891',	1,	'',	2,	5,	NULL,	'1'),
(122,	'Ms P.ANANTHI',	'CS10894',	1,	'',	2,	5,	NULL,	'1'),
(123,	'Ms M.VAISHNAVI',	'CS10897',	1,	'',	2,	5,	NULL,	'1'),
(124,	'Ms S.RAMASAMI',	'CS10946',	1,	'',	2,	5,	NULL,	'1'),
(125,	'Ms S.RAMASAMI',	'CS10946',	1,	'',	2,	5,	NULL,	'1'),
(126,	'Sabareesh',	'CS282',	1,	'sabareesh.cs22@bitsathy.ac.in',	0,	0,	NULL,	'1');

CREATE TABLE `master_hod` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faculty` int NOT NULL,
  `department` int NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `faculty` (`faculty`),
  KEY `department` (`department`),
  CONSTRAINT `master_hod_ibfk_1` FOREIGN KEY (`faculty`) REFERENCES `master_faculty` (`id`),
  CONSTRAINT `master_hod_ibfk_2` FOREIGN KEY (`department`) REFERENCES `master_department` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `master_hod` (`id`, `faculty`, `department`, `status`) VALUES
(4,	46,	1,	'1'),
(9,	126,	1,	'1');

CREATE TABLE `master_regulation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `regulation` varchar(255) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `master_regulation` (`id`, `regulation`, `status`) VALUES
(1,	'2022',	'1'),
(2,	'2018',	'1'),
(3,	'2014',	'1'),
(4,	'2010',	'1');

CREATE TABLE `master_semcode` (
  `id` int NOT NULL AUTO_INCREMENT,
  `semcode` varchar(255) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `master_semcode` (`id`, `semcode`, `status`) VALUES
(46,	'SEEAUG24',	'1'),
(47,	'SEEAUG23',	'1');

CREATE TABLE `master_semester` (
  `id` int NOT NULL AUTO_INCREMENT,
  `semester` varchar(255) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `master_semester` (`id`, `semester`, `status`) VALUES
(1,	'1 - ODD ',	'1'),
(2,	'2 - EVEN',	'1'),
(3,	'3 - ODD',	'1'),
(4,	'4 - EVEN',	'1'),
(5,	'5 - ODD',	'1'),
(6,	'6 - EVEN',	'1'),
(7,	'7 - ODD',	'1');

CREATE TABLE `master_year` (
  `id` int NOT NULL AUTO_INCREMENT,
  `year` varchar(255) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `master_year` (`id`, `year`, `status`) VALUES
(1,	'I',	'1'),
(2,	'II',	'1'),
(3,	'III',	'1'),
(4,	'IV',	'1');

CREATE TABLE `semcodeMapping` (
  `id` int NOT NULL AUTO_INCREMENT,
  `semcode_id` int NOT NULL,
  `semester` int NOT NULL,
  `batch` int NOT NULL,
  `year` int NOT NULL,
  `regulation` int NOT NULL,
  `status` enum('0','1') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `semcode_id` (`semcode_id`),
  CONSTRAINT `semcodeMapping_ibfk_1` FOREIGN KEY (`semcode_id`) REFERENCES `master_semcode` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `semcodeMapping` (`id`, `semcode_id`, `semester`, `batch`, `year`, `regulation`, `status`) VALUES
(6,	46,	1,	1,	1,	1,	'1'),
(7,	47,	1,	1,	2,	1,	'1'),
(8,	47,	1,	2,	1,	1,	'1'),
(9,	46,	1,	3,	1,	1,	'1'),
(10,	46,	1,	2,	1,	1,	'1');

-- 2024-08-23 17:31:23
