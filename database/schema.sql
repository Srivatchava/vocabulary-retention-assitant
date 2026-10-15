-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: vocab_assistant
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Category_user_id_fkey` (`user_id`),
  CONSTRAINT `Category_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,1,'Living Spaces','2026-08-14 21:44:05.000'),(2,1,'Mental Focus','2026-08-14 21:51:18.000'),(3,1,'Programming Concepts','2026-08-14 23:35:19.000'),(4,3,'Cognition and Purpose','2026-08-15 21:12:59.000'),(5,3,'Security','2026-08-15 21:13:16.000'),(6,2,'Abstract Concepts','2026-08-15 22:12:12.000'),(7,2,'Computer Science','2026-09-08 00:55:09.000'),(8,1,'Family Relations','2026-10-01 22:31:54.000'),(9,1,'Technology','2026-10-15 01:16:34.000');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reminder`
--

DROP TABLE IF EXISTS `reminder`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reminder` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `reminder_date` date NOT NULL,
  `reminder_sent` tinyint(1) NOT NULL DEFAULT '0',
  `practice_completed` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `Reminder_user_id_fkey` (`user_id`),
  CONSTRAINT `Reminder_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reminder`
--

LOCK TABLES `reminder` WRITE;
/*!40000 ALTER TABLE `reminder` DISABLE KEYS */;
INSERT INTO `reminder` VALUES (1,2,'2026-08-15',1,0),(2,1,'2026-08-15',1,0),(3,2,'2026-08-15',1,0),(4,3,'2026-08-15',1,0),(5,1,'2026-10-10',1,0),(6,2,'2026-10-10',1,0),(7,3,'2026-10-10',1,0),(8,1,'2026-10-13',1,0),(9,3,'2026-10-13',1,0),(10,4,'2026-10-13',1,0);
/*!40000 ALTER TABLE `reminder` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_date` date NOT NULL,
  `paragraphs` json NOT NULL,
  `words_included` json NOT NULL,
  `completion_status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Session_user_id_fkey` (`user_id`),
  CONSTRAINT `Session_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session`
--

LOCK TABLES `session` WRITE;
/*!40000 ALTER TABLE `session` DISABLE KEYS */;
INSERT INTO `session` VALUES (1,1,'2026-08-14','[\"Moving into a new dwelling often feels like the start of a blank canvas for one\'s personality. I spent the entire weekend rearranging furniture to maximize the natural light flowing through the living room. It is truly rewarding to transform a basic floor plan into a place that feels like home. Small touches, like potted plants and soft textiles, make the entire environment feel much more inviting. I am finally beginning to settle into this space comfortably.\", \"When I sit down to work, I often find myself dwelling on minor distractions instead of the task at hand. It takes a conscious effort to clear my mind and return to the primary objective. By setting a timer, I force my brain to prioritize the most important responsibilities on my list. Deep concentration rarely comes naturally, but practicing mindfulness has certainly improved my daily output. With consistent focus, even the most complex projects become manageable.\"]','[[1], [2]]',1,'2026-08-14 22:07:31.000'),(2,1,'2026-08-15','[\"Software engineers often rely on complex architectural patterns to make their code more flexible and reusable. By utilizing polymorphism, a developer can ensure that a single interface can interact with various data types seamlessly. This approach reduces redundant logic while improving the overall scalability of the application. It remains a cornerstone for those building robust systems that must evolve over time.\", \"The journey of a creative project often traces back to its original inception in a quiet moment of reflection. Achieving deep work requires a persistent effort to ignore the constant barrage of digital distractions. Without a clear sense of intent, one might find themselves aimlessly jumping between unrelated tasks. True mental focus is not about dwelling on past mistakes, but rather about anchoring your mind to the current objective.\", \"Designing a functional living space requires a careful balance between aesthetic appeal and everyday utility. Your choice of furniture can dramatically influence how much light flows through your primary dwelling. Small additions like house plants or modular shelving units can help define the atmosphere of a room. Whether you prefer a minimalist look or a cozy aesthetic, the layout should always prioritize your personal comfort.\"]','[[4], [2, 3, 5, 6], [1]]',1,'2026-08-15 20:32:27.000'),(3,3,'2026-08-15','[\"Setting clear goals is the first step toward achieving professional mastery. When you approach a complex project with a focused intent, your mental clarity significantly improves. This deliberate mindset helps filter out distractions that often hinder long-term progress. By aligning your daily actions with your broader ambitions, you cultivate a sense of purpose. Ultimately, staying consistent with your objectives ensures that every effort contributes to your personal growth.\", \"Modern digital systems require robust safeguards to protect sensitive user information from potential threats. Any unauthorized intrusion into a private network can lead to devastating consequences for both individuals and corporations. Security experts work tirelessly to identify vulnerabilities before hackers can exploit them for malicious gain. By implementing multi-layered authentication and frequent encryption updates, organizations can effectively fortify their defenses. Constant vigilance remains the best strategy for maintaining the integrity of private data in an interconnected world.\"]','[[7], [8]]',1,'2026-08-15 21:13:23.000'),(4,2,'2026-08-15','[\"Many people drift through their daily routines without pausing to consider their true direction in life. Discovering a sense of purpose often requires one to look past immediate distractions and focus on long-term goals. When you approach a difficult task with a clear intent, every action becomes more deliberate and meaningful. This shift in mindset can turn mundane chores into stepping stones for personal growth. Ultimately, aligning your daily habits with your core values is the key to lasting fulfillment.\"]','[[9]]',1,'2026-08-15 22:12:18.000'),(5,1,'2026-09-07','[\"Software engineers often rely on complex architectural patterns to make their code more flexible and reusable. By implementing polymorphism, developers allow different objects to respond to the same method call in unique ways. This abstraction layer hides internal logic while providing a consistent interface for the rest of the application. Mastering this concept is essential for building scalable systems that can handle evolving requirements. It effectively bridges the gap between simple scripts and robust, professional-grade software.\", \"Cultivating deep focus requires a clear intent behind every task you choose to undertake during the workday. Many people lose their momentum because they mistake the inception of a new idea for an urgent need to pivot away from their current project. Such distractions are often ephemeral, vanishing as quickly as they appear if you simply stay the course. Instead of dwelling on fleeting impulses, try to maintain a steady rhythm that honors your original objectives. A disciplined mind is the most powerful tool for achieving long-term productivity.\", \"Finding the perfect dwelling involves balancing your personal aesthetic preferences with the functional realities of a daily commute. A well-designed home should offer a sanctuary that rejuvenates the spirit after a long, taxing day in the city. Many people prioritize natural light and open floor plans to create a sense of tranquility within their living environment. Whether you rent or own, your space serves as a reflection of your priorities and lifestyle choices. Ultimately, the quality of your surroundings significantly impacts your overall sense of well-being.\"]','[[4], [5, 6, 10, 2], [1]]',1,'2026-09-08 00:53:32.000'),(6,1,'2026-10-01','[\"When searching for a new place to call home, many people prioritize natural light and open floor plans. A cozy dwelling can provide a necessary sanctuary from the frantic pace of modern city life. It is important to consider both the neighborhood amenities and the structural integrity of the building. With careful planning, you can transform any space into a reflection of your personal style.\", \"True mastery of a subject often begins with the humble inception of a single idea. While moments of inspiration may seem ephemeral, they can grow into profound insights if nurtured correctly. The key to long-term success is a persistent dedication to your goals, even when progress feels slow. Instead of dwelling on past setbacks, focus your energy on the next stage of your intellectual journey.\", \"In object-oriented design, developers often utilize polymorphism to make their code more flexible and reusable. By allowing different classes to be treated as instances of a common superclass, one can invoke the same method name to trigger unique behaviors. This approach simplifies complex systems and reduces the need for redundant logic across the application. Mastering this concept is essential for any programmer aiming to build scalable software architectures.\"]','[[1], [2, 3, 5, 10], [4]]',1,'2026-10-01 22:27:01.000'),(7,2,'2026-10-10','[\"Modern software development relies heavily on the efficiency provided by multithreading in os architectures to handle complex tasks. By allowing multiple threads to execute concurrently within a single process, programs can maintain responsiveness even during intensive calculations. This approach minimizes idle time for the processor and maximizes overall system throughput. Developers must carefully manage synchronization to avoid errors when different threads access shared resources simultaneously. Ultimately, mastering these concurrent patterns is essential for building high-performance applications in today\'s computing environment.\", \"The true value of an action is often hidden beneath the surface of our initial intent. Sometimes, we rely on a sudden intuition to guide us toward a decision when logic alone feels insufficient. From the very inception of a new idea, the path forward is rarely as clear as we might hope. Navigating these abstract challenges requires a balance between our analytical mind and our deepest instincts. By reflecting on our motivations, we gain a more profound understanding of why we pursue the goals we set for ourselves.\"]','[[12], [9, 11, 13]]',0,'2026-10-10 21:15:59.000'),(8,1,'2026-10-11','[\"Selecting a new dwelling requires careful consideration of the neighborhood\'s atmosphere and local amenities. Before moving into your potential home, check that every electrical outlet is properly grounded and functional. A well-designed living area balances aesthetic appeal with the practical needs of daily life. These small details often determine how quickly a house feels like a sanctuary.\", \"Achieving deep concentration requires us to recognize the ephemeral nature of our passing distractions. Rather than dwelling on every minor interruption, we must return our attention to the task at hand with renewed vigor. From the project\'s inception, maintaining a clear mental framework is essential for long-term success. Through persistent effort, even the most complex goals become manageable over time.\", \"Mastering the concept of polymorphism allows developers to write code that is both flexible and reusable. By creating functions that can operate on different data types, programs become significantly more adaptable. This technique enables a single interface to represent various underlying forms, reducing overall complexity. Ultimately, this approach simplifies the architectural design of sophisticated software systems.\"]','[[1, 16], [10, 2, 5, 3], [4]]',1,'2026-10-11 23:20:14.000'),(9,2,'2026-10-12','[\"Modern software development relies heavily on optimizing performance for complex tasks. Developers often utilize multithreading in os environments to ensure that multiple operations run simultaneously within a single process. By distributing workloads across different processor cores, the system achieves a significant increase in efficiency. This approach prevents applications from freezing when handling resource-heavy data. Ultimately, mastery of these concurrent processes is essential for building scalable applications.\", \"Every significant change in our lives often begins with a subtle, sudden inception of a new idea. While logic plays a role in our decisions, we frequently find ourselves guided by a mysterious intuition that warns us of potential outcomes. It is important to examine the true intent behind our actions before we commit to a specific path. By balancing our gut feelings with careful reflection, we navigate uncertainty with greater clarity. Learning to trust this internal process helps us align our daily habits with our long-term goals.\"]','[[12], [9, 11, 13]]',1,'2026-10-13 00:25:03.000'),(10,2,'2026-10-13','[\"Modern software development relies heavily on efficient resource management to handle complex tasks simultaneously. By implementing multithreading in os architecture, programmers can execute multiple sequences of instructions within a single process. This approach significantly boosts performance by ensuring that background operations do not block user interactions. Developers must carefully synchronize these threads to prevent data corruption and race conditions. Ultimately, mastering this technique is essential for building responsive and scalable applications.\", \"The initial inception of a creative idea often feels like a fleeting spark of inspiration. Over time, that spark requires a clear intent to transform into a tangible reality. Sometimes, we must rely on our innate intuition to navigate the uncertainties that arise during the creative process. Trusting one\'s inner voice helps bridge the gap between an abstract thought and a finished project. This balance between careful planning and spontaneous insight defines the journey of innovation.\"]','[[12], [9, 11, 13]]',1,'2026-10-14 00:04:01.000'),(11,3,'2026-10-13','[\"Every great achievement begins with a clear sense of intent that guides our daily actions. When we focus our mental energy on a specific goal, we begin to filter out the trivial distractions that clutter our thoughts. This cognitive discipline allows us to pursue complex challenges with greater efficiency and precision. By aligning our choices with our long-term vision, we transform abstract ideas into tangible reality.\", \"The IT department worked tirelessly to fortify the network against any unauthorized intrusion. They implemented multi-factor authentication to ensure that only verified personnel could access sensitive company data. Regular security audits helped the team identify potential vulnerabilities before they could be exploited by malicious actors. Protecting digital infrastructure is a constant process that demands vigilance and proactive maintenance.\"]','[[7], [8]]',1,'2026-10-14 01:52:06.000');
/*!40000 ALTER TABLE `session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `streak_count` int NOT NULL DEFAULT '0',
  `last_login` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'s1@gmail.com','$2b$10$p0XxsB.bBv24utc/B3e8DehId95kz8QWymdLoLDQv11r.n0ZhBKQC',0,'2026-10-15 00:58:19.854','2026-08-14 01:09:26.599',NULL),(2,'s2@gmail.com','$2b$10$L/7QvHeT7MCdiKv/MUTThuFzTTJRhZQoYlR3Iw1zuuigV5Vyzn0JC',0,'2026-10-13 00:24:37.468','2026-08-14 01:17:59.079','mic'),(3,'srivatchavacog@gmail.com','$2b$10$EdUYiCzSAQtgcNcTcHXY2uJEoEe0QJ3KycpMxXGF/4Pg.R6oSfO7G',0,'2026-10-15 00:55:54.854','2026-08-15 21:12:45.178','sv'),(4,'s3@gmail.com','$2b$10$AuSlv24N7JmpiOK9jDicfOmHWDPk0a2RfqthijwMy2TfVEhs/7QUi',0,NULL,'2026-10-12 02:03:33.653','s3');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `word`
--

DROP TABLE IF EXISTS `word`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `word` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `word_text` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `context` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meaning` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `times_practiced` int NOT NULL DEFAULT '0',
  `times_forgotten` int NOT NULL DEFAULT '0',
  `familiarity_level` enum('new','learning','familiar','mastered') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `last_practiced_date` date DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `next_review_date` date NOT NULL DEFAULT (curdate()),
  PRIMARY KEY (`id`),
  KEY `Word_user_id_fkey` (`user_id`),
  KEY `Word_category_id_fkey` (`category_id`),
  CONSTRAINT `Word_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Word_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `word`
--

LOCK TABLES `word` WRITE;
/*!40000 ALTER TABLE `word` DISABLE KEYS */;
INSERT INTO `word` VALUES (1,1,1,'dwelling',NULL,'A house, apartment, or other place of residence where a person lives.',2,1,'learning','2026-10-01','2026-08-14 21:44:05.000','2026-10-04'),(2,1,2,'dwelling','a person dwelling on the past','In this context, it means to persistently think about or focus on a particular subject, especially something negative or past-related.',1,1,'new','2026-08-14','2026-08-14 21:51:18.000','2026-10-14'),(3,1,2,'persistent',NULL,'Continuing to do something or exist despite difficulties, obstacles, or opposition.',0,0,'new',NULL,'2026-08-14 22:10:05.000','2026-10-14'),(4,1,3,'polymorshism','in java','In Java, polymorphism is the ability of an object to take on many forms, typically allowing a subclass to be treated as an instance of its superclass through method overriding or overloading.',0,0,'new',NULL,'2026-08-14 23:35:19.000','2026-10-14'),(5,1,2,'inception',NULL,'The establishment or starting point of an institution, activity, or process.',2,2,'new','2026-10-01','2026-08-15 00:09:21.000','2026-10-14'),(6,1,2,'intent',NULL,'An aim, purpose, or firm intention to perform a specific action.',0,0,'new',NULL,'2026-08-15 20:32:16.000','2026-10-14'),(7,3,4,'intent',NULL,'An intention or purpose; the goal or objective that someone has in mind when performing an action.',1,0,'learning','2026-10-13','2026-08-15 21:12:59.000','2026-10-16'),(8,3,5,'intrusion','in cyber','The act of gaining unauthorized access to a computer system, network, or data.',1,1,'new','2026-10-13','2026-08-15 21:13:16.000','2026-10-14'),(9,2,6,'intent',NULL,'An aim, purpose, or firm intention to achieve a specific result.',1,0,'learning','2026-10-13','2026-08-15 22:12:12.000','2026-10-16'),(10,1,2,'ephemeral',NULL,'Lasting for a very short time; transitory or fleeting.',0,0,'new',NULL,'2026-08-15 23:06:00.000','2026-10-14'),(11,2,6,'intrution',NULL,'It is likely a misspelling of \'intrusion,\' which refers to the act of forcing oneself into a place or situation where one is uninvited or unwelcome.',1,0,'learning','2026-10-13','2026-09-08 00:54:40.000','2026-10-16'),(12,2,7,'multithreading in os',NULL,'A technique in operating systems that allows a single process to contain multiple threads of execution, enabling concurrent processing within that process.',1,1,'new','2026-10-13','2026-09-08 00:55:09.000','2026-10-14'),(13,2,6,'inception',NULL,'The establishment or starting point of an institution, activity, or process.',1,1,'new','2026-10-13','2026-09-08 00:55:31.000','2026-10-14'),(14,1,8,'paternal grandfather',NULL,'The father of one\'s father.',0,0,'new',NULL,'2026-10-01 22:31:54.000','2026-10-14'),(15,1,8,'maternal grandfather',NULL,'The father of one\'s mother.',0,0,'new',NULL,'2026-10-01 22:32:24.000','2026-10-14'),(16,1,1,'outlet',NULL,'An electrical socket in a wall to which the plug of an electrical device is connected.',0,0,'new',NULL,'2026-10-10 22:07:15.000','2026-10-14'),(17,3,5,'fortify',NULL,'To strengthen or reinforce a place or oneself against attack or potential challenge.',0,0,'new',NULL,'2026-10-14 01:56:11.000','2026-10-13'),(18,1,9,'mic',NULL,'An abbreviation for microphone, a device used to convert sound waves into electrical signals for recording or amplification.',0,0,'new',NULL,'2026-10-15 01:16:34.000','2026-10-14');
/*!40000 ALTER TABLE `word` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-15 18:01:01
