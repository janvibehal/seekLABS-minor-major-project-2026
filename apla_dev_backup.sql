--
-- PostgreSQL database dump
--

\restrict oSxeWpic4ffcnzFezM4MRQTfbC6htnuBci2tasDbvSAclUmevLJ3mgEEDmh7Les

-- Dumped from database version 18.6 (Debian 18.6-1.pgdg13+2)
-- Dumped by pg_dump version 18.6 (Debian 18.6-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: Difficulty; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Difficulty" AS ENUM (
    'EASY',
    'MEDIUM',
    'HARD'
);


ALTER TYPE public."Difficulty" OWNER TO postgres;

--
-- Name: InterviewStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InterviewStatus" AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public."InterviewStatus" OWNER TO postgres;

--
-- Name: JobStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."JobStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'CLOSED'
);


ALTER TYPE public."JobStatus" OWNER TO postgres;

--
-- Name: MessageSender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MessageSender" AS ENUM (
    'AI',
    'CANDIDATE'
);


ALTER TYPE public."MessageSender" OWNER TO postgres;

--
-- Name: QuestionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QuestionStatus" AS ENUM (
    'PENDING',
    'CURRENT',
    'COMPLETED'
);


ALTER TYPE public."QuestionStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'RECRUITER',
    'CANDIDATE'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: SessionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SessionStatus" AS ENUM (
    'IN_PROGRESS',
    'COMPLETED',
    'EXPIRED'
);


ALTER TYPE public."SessionStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: EmailVerificationToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmailVerificationToken" (
    id text NOT NULL,
    "tokenHash" text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."EmailVerificationToken" OWNER TO postgres;

--
-- Name: Evaluation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Evaluation" (
    id text NOT NULL,
    "interviewId" text NOT NULL,
    "sessionId" text NOT NULL,
    "candidateId" text NOT NULL,
    "overallScore" integer NOT NULL,
    "algorithmCorrectness" integer NOT NULL,
    "logicalReasoning" integer NOT NULL,
    "conceptCoverage" integer NOT NULL,
    completeness integer NOT NULL,
    "dataStructure" integer NOT NULL,
    complexity integer NOT NULL,
    "edgeCases" integer NOT NULL,
    strengths text[],
    improvements text[],
    feedback text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Evaluation" OWNER TO postgres;

--
-- Name: Interview; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Interview" (
    id text NOT NULL,
    title text NOT NULL,
    type text DEFAULT 'Technical Interview'::text NOT NULL,
    company text,
    "focusAreas" text[],
    "scheduledAt" timestamp(3) without time zone NOT NULL,
    duration integer DEFAULT 45 NOT NULL,
    status public."InterviewStatus" DEFAULT 'SCHEDULED'::public."InterviewStatus" NOT NULL,
    "candidateId" text NOT NULL,
    "recruiterId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Interview" OWNER TO postgres;

--
-- Name: InterviewQuestion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InterviewQuestion" (
    id text NOT NULL,
    "interviewId" text NOT NULL,
    "questionId" text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    status public."QuestionStatus" DEFAULT 'PENDING'::public."QuestionStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InterviewQuestion" OWNER TO postgres;

--
-- Name: InterviewSession; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InterviewSession" (
    id text NOT NULL,
    "interviewId" text NOT NULL,
    "candidateId" text NOT NULL,
    status public."SessionStatus" DEFAULT 'IN_PROGRESS'::public."SessionStatus" NOT NULL,
    "currentQuestionId" text,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endedAt" timestamp(3) without time zone,
    "durationSeconds" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."InterviewSession" OWNER TO postgres;

--
-- Name: Job; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Job" (
    id text NOT NULL,
    title text NOT NULL,
    department text,
    location text,
    description text NOT NULL,
    requirements text[],
    status public."JobStatus" DEFAULT 'DRAFT'::public."JobStatus" NOT NULL,
    "recruiterId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Job" OWNER TO postgres;

--
-- Name: JobQuestion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."JobQuestion" (
    id text NOT NULL,
    "jobId" text NOT NULL,
    "questionId" text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."JobQuestion" OWNER TO postgres;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "questionId" text,
    sender public."MessageSender" NOT NULL,
    message text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Message" OWNER TO postgres;

--
-- Name: PasswordResetToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PasswordResetToken" (
    id text NOT NULL,
    "tokenHash" text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PasswordResetToken" OWNER TO postgres;

--
-- Name: Question; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Question" (
    id text NOT NULL,
    title text NOT NULL,
    difficulty public."Difficulty" DEFAULT 'MEDIUM'::public."Difficulty" NOT NULL,
    topics text[],
    description text NOT NULL,
    examples jsonb DEFAULT '[]'::jsonb NOT NULL,
    constraints text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Question" OWNER TO postgres;

--
-- Name: QuestionAttempt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."QuestionAttempt" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "questionId" text NOT NULL,
    "candidateId" text NOT NULL,
    status public."QuestionStatus" DEFAULT 'CURRENT'::public."QuestionStatus" NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."QuestionAttempt" OWNER TO postgres;

--
-- Name: RefreshToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RefreshToken" (
    id text NOT NULL,
    "tokenHash" text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RefreshToken" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" DEFAULT 'CANDIDATE'::public."Role" NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: EmailVerificationToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmailVerificationToken" (id, "tokenHash", "userId", "expiresAt", "usedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Evaluation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Evaluation" (id, "interviewId", "sessionId", "candidateId", "overallScore", "algorithmCorrectness", "logicalReasoning", "conceptCoverage", completeness, "dataStructure", complexity, "edgeCases", strengths, improvements, feedback, "createdAt") FROM stdin;
cmtzxd2nh0009r0v67o6wz97z	cmtzwu75w0001r0v671s0m4jo	cmtzwugmb0004r0v60vkr35d8	cmtzolx4u0000g8v66fc8kehy	92	100	90	95	90	90	90	90	{}	{}		2026-09-13 14:44:11.309
cmu01b0be000or0v6lktl2hek	cmu00u2vl000jr0v62vd4ab4x	cmu011wsb000mr0v674gp1krd	cmtzolx4u0000g8v66fc8kehy	0	0	0	0	0	0	0	0	{}	{}		2026-09-13 16:34:33.434
cmu023vdl000cp0v6ubq78dwu	cmu01ol7x0001p0v633u6hy0u	cmu01ox0h0004p0v6mpz4ofzm	cmtzolx4u0000g8v66fc8kehy	10	10	9	9	10	10	10	9	{}	{}		2026-09-13 16:57:00.057
cmu04o5gv000cogv6kr5lrsfq	cmu0467xk0001ogv64qa6ivjz	cmu046iq10004ogv6exv5baaa	cmtzolx4u0000g8v66fc8kehy	9	10	9	9	10	10	9	9	{}	{}		2026-09-13 18:08:45.487
cmu04vp3l000jogv6lv0jk3vt	cmu04tqek000eogv653etou45	cmu04u1os000hogv604sk8iub	cmtzolx4u0000g8v66fc8kehy	9	10	9	9	10	9	8	9	{}	{}		2026-09-13 18:14:37.521
cmu0864rm0021ogv64l0jvop5	cmu0796ln001iogv63p2lrjle	cmu079rl9001mogv6f7ffxw4w	cmtzolx4u0000g8v66fc8kehy	0	0	0	0	0	0	0	0	{}	{}		2026-09-13 19:46:43.234
cmu1c0vt7000gdov61xdvl486	cmu1aech100015sv6xx6bj2bu	cmu1aeqkl00045sv64mxtxu13	cmtzolx4u0000g8v66fc8kehy	77	85	70	75	70	90	90	60	{}	{}		2026-09-14 14:22:22.987
cmu1gc8cr000c5ov6cla0n6p6	cmu1eeuek0001ygv6vh4t9bbm	cmu1fnkhq000038v6z1pe65nk	cmtzolx4u0000g8v66fc8kehy	73	80	60	70	65	80	85	0	{}	{}		2026-09-14 16:23:10.923
\.


--
-- Data for Name: Interview; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Interview" (id, title, type, company, "focusAreas", "scheduledAt", duration, status, "candidateId", "recruiterId", "createdAt", "updatedAt") FROM stdin;
cmtzoqwzq000494v6l7sqwtiv	Backend Developer Interview	Technical Coding Interview	Tech Solutions	{"Data Structures",Algorithms,"Problem Solving"}	2026-09-14 10:43:00.571	45	COMPLETED	cmtzolx4u0000g8v66fc8kehy	cmtzoqwwv000094v61wx9pb0r	2026-09-13 10:43:00.614	2026-09-13 11:28:59.515
cmtzt2yzm00010sv6v4vciynx	DSA easy	Coding Interview	InterviewAI	{Arrays}	2026-09-13 12:43:00	10	COMPLETED	cmtzolx4u0000g8v66fc8kehy	cmtzoqwwv000094v61wx9pb0r	2026-09-13 12:44:21.538	2026-09-13 12:56:21.155
cmtzwu75w0001r0v671s0m4jo	xyz	Technical Interview	zzz	{Arrays}	2026-09-13 14:29:00	15	COMPLETED	cmtzolx4u0000g8v66fc8kehy	cmtzoqwwv000094v61wx9pb0r	2026-09-13 14:29:30.692	2026-09-13 14:39:08.779
cmtzxivqh000br0v64mkk8e1m	abc	Technical Interview	a	{}	2026-09-13 14:48:00	22	COMPLETED	cmtzolx4u0000g8v66fc8kehy	cmtzoqwwv000094v61wx9pb0r	2026-09-13 14:48:42.281	2026-09-13 15:02:30.917
cmu00u2vl000jr0v62vd4ab4x	aasdsad	Technical Interview	kkkkk	{Arrays}	2026-09-13 16:30:00	20	COMPLETED	cmtzolx4u0000g8v66fc8kehy	cmtzoqwwv000094v61wx9pb0r	2026-09-13 16:21:23.601	2026-09-13 16:29:30.183
cmu01ol7x0001p0v633u6hy0u	dd	Technical Interview	ddd	{Arrays}	2026-09-13 16:46:00	10	COMPLETED	cmtzolx4u0000g8v66fc8kehy	cmtzoqwwv000094v61wx9pb0r	2026-09-13 16:45:07.053	2026-09-13 16:53:12.489
cmu0467xk0001ogv64qa6ivjz	jk	DSA Interview	jk	{Arrays}	2026-09-13 17:54:00	10	COMPLETED	cmtzolx4u0000g8v66fc8kehy	cmtzoqwwv000094v61wx9pb0r	2026-09-13 17:54:48.872	2026-09-13 18:05:23.732
cmu04tqek000eogv653etou45	ui	Technical Interview	ux	{Arrays}	2026-09-13 18:12:00	51	COMPLETED	cmtzolx4u0000g8v66fc8kehy	cmtzoqwwv000094v61wx9pb0r	2026-09-13 18:13:05.9	2026-09-13 18:13:25.936
cmu04yatx000logv6v62lzlng	ugc	Technical Interview	ugvc	{Strings}	2026-09-13 18:16:00	51	COMPLETED	cmtzolx4u0000g8v66fc8kehy	cmtzoqwwv000094v61wx9pb0r	2026-09-13 18:16:38.997	2026-09-13 19:12:11.007
cmu0796ln001iogv63p2lrjle	m	Technical Interview	\N	{}	2026-09-13 19:20:00	61	COMPLETED	cmtzolx4u0000g8v66fc8kehy	cmtzoqwwv000094v61wx9pb0r	2026-09-13 19:21:05.963	2026-09-13 19:42:40.678
cmu1aech100015sv6xx6bj2bu	00	Technical Interview	\N	{}	2026-09-14 13:36:00	50	COMPLETED	cmtzolx4u0000g8v66fc8kehy	cmtzoqwwv000094v61wx9pb0r	2026-09-14 13:36:51.877	2026-09-14 14:21:29.7
cmu1dp87w0001d0v6wq8w4z4h	f	Technical Interview	\N	{}	2026-09-14 15:09:00	60	COMPLETED	cmtzolx4u0000g8v66fc8kehy	cmtzoqwwv000094v61wx9pb0r	2026-09-14 15:09:18.428	2026-09-14 15:20:21.194
cmu1enw380001cgv6q31sw2of	to check if the interview can be started before the scheduled time	Technical Interview	\N	{Arrays}	2026-09-14 16:00:00	30	SCHEDULED	cmtzolx4u0000g8v66fc8kehy	cmtzoqwwv000094v61wx9pb0r	2026-09-14 15:36:15.668	2026-09-14 15:36:15.668
cmu1eovfu0003cgv6yq8w1gcn	to check if the interview can expire	Technical Interview	\N	{Arrays}	2026-09-14 15:50:00	10	EXPIRED	cmtzolx4u0000g8v66fc8kehy	cmtzoqwwv000094v61wx9pb0r	2026-09-14 15:37:01.482	2026-09-14 16:01:16.901
cmu1eeuek0001ygv6vh4t9bbm	recent one shud be on top	Technical Interview	\N	{}	2026-09-14 15:28:00	60	COMPLETED	cmtzolx4u0000g8v66fc8kehy	cmtzoqwwv000094v61wx9pb0r	2026-09-14 15:29:13.58	2026-09-14 16:22:20.526
\.


--
-- Data for Name: InterviewQuestion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InterviewQuestion" (id, "interviewId", "questionId", "order", status, "createdAt") FROM stdin;
cmtzoqwzx000794v6394tegso	cmtzoqwzq000494v6l7sqwtiv	cmtzoqwyb000394v6g8g97buo	2	PENDING	2026-09-13 10:43:00.614
cmtzoqwzx000594v60p4vjh42	cmtzoqwzq000494v6l7sqwtiv	cmtzoqwxp000194v6h9r5km2o	0	COMPLETED	2026-09-13 10:43:00.614
cmtzoqwzx000694v6vavpyar6	cmtzoqwzq000494v6l7sqwtiv	cmtzoqwy0000294v6bc12er39	1	CURRENT	2026-09-13 10:43:00.614
cmtzt2yzq00020sv6mm65ooyl	cmtzt2yzm00010sv6v4vciynx	cmtzoqwxp000194v6h9r5km2o	1	CURRENT	2026-09-13 12:44:21.538
cmtzwu7650002r0v69r8hnx6s	cmtzwu75w0001r0v671s0m4jo	cmtzoqwxp000194v6h9r5km2o	1	CURRENT	2026-09-13 14:29:30.692
cmtzxivql000cr0v6lt4z1rlc	cmtzxivqh000br0v64mkk8e1m	cmtzoqwxp000194v6h9r5km2o	1	CURRENT	2026-09-13 14:48:42.281
cmu00u2vv000kr0v6ji2wllm1	cmu00u2vl000jr0v62vd4ab4x	cmtzoqwxp000194v6h9r5km2o	1	CURRENT	2026-09-13 16:21:23.601
cmu01ol810002p0v6lth1i4yy	cmu01ol7x0001p0v633u6hy0u	cmtzoqwxp000194v6h9r5km2o	1	CURRENT	2026-09-13 16:45:07.053
cmu0467xq0002ogv6p6xxsjmo	cmu0467xk0001ogv64qa6ivjz	cmtzoqwxp000194v6h9r5km2o	1	CURRENT	2026-09-13 17:54:48.872
cmu04tqen000fogv66mttikzs	cmu04tqek000eogv653etou45	cmtzoqwxp000194v6h9r5km2o	1	CURRENT	2026-09-13 18:13:05.9
cmu04yau2000mogv6k2ltn7fo	cmu04yatx000logv6v62lzlng	cmtzoqwxp000194v6h9r5km2o	1	COMPLETED	2026-09-13 18:16:38.997
cmu0796lq001jogv6yjbbqzwv	cmu0796ln001iogv63p2lrjle	cmtzoqwxp000194v6h9r5km2o	1	COMPLETED	2026-09-13 19:21:05.963
cmu0796lq001kogv68o9ivo0c	cmu0796ln001iogv63p2lrjle	cmtzoqwy0000294v6bc12er39	2	CURRENT	2026-09-13 19:21:05.963
cmu1aech300025sv6kjh3qtx8	cmu1aech100015sv6xx6bj2bu	cmtzoqwxp000194v6h9r5km2o	1	COMPLETED	2026-09-14 13:36:51.877
cmu1dp87z0002d0v6bg22l85b	cmu1dp87w0001d0v6wq8w4z4h	cmtzoqwxp000194v6h9r5km2o	1	CURRENT	2026-09-14 15:09:18.428
cmu1enw3b0002cgv6ll4cqany	cmu1enw380001cgv6q31sw2of	cmtzoqwxp000194v6h9r5km2o	1	PENDING	2026-09-14 15:36:15.668
cmu1eovfw0004cgv6agwepbvg	cmu1eovfu0003cgv6yq8w1gcn	cmtzoqwxp000194v6h9r5km2o	1	PENDING	2026-09-14 15:37:01.482
cmu1eeuen0002ygv6j6orw4uy	cmu1eeuek0001ygv6vh4t9bbm	cmtzoqwxp000194v6h9r5km2o	1	COMPLETED	2026-09-14 15:29:13.58
\.


--
-- Data for Name: InterviewSession; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InterviewSession" (id, "interviewId", "candidateId", status, "currentQuestionId", "startedAt", "endedAt", "durationSeconds", "createdAt", "updatedAt") FROM stdin;
cmtzp0ucq000174v6cc1a4fiv	cmtzoqwzq000494v6l7sqwtiv	cmtzolx4u0000g8v66fc8kehy	COMPLETED	cmtzoqwy0000294v6bc12er39	2026-09-13 10:50:43.754	2026-09-13 11:28:59.508	2295	2026-09-13 10:50:43.754	2026-09-13 11:28:59.509
cmtzt3f9i00040sv6nq48zssg	cmtzt2yzm00010sv6v4vciynx	cmtzolx4u0000g8v66fc8kehy	COMPLETED	cmtzoqwxp000194v6h9r5km2o	2026-09-13 12:44:42.63	2026-09-13 12:56:21.136	698	2026-09-13 12:44:42.63	2026-09-13 12:56:21.14
cmtzwugmb0004r0v60vkr35d8	cmtzwu75w0001r0v671s0m4jo	cmtzolx4u0000g8v66fc8kehy	COMPLETED	cmtzoqwxp000194v6h9r5km2o	2026-09-13 14:29:42.947	2026-09-13 14:39:08.769	565	2026-09-13 14:29:42.947	2026-09-13 14:39:08.771
cmtzxjgxd000er0v64lq79eb8	cmtzxivqh000br0v64mkk8e1m	cmtzolx4u0000g8v66fc8kehy	COMPLETED	cmtzoqwxp000194v6h9r5km2o	2026-09-13 14:49:09.745	2026-09-13 15:02:30.909	801	2026-09-13 14:49:09.745	2026-09-13 15:02:30.91
cmu011wsb000mr0v674gp1krd	cmu00u2vl000jr0v62vd4ab4x	cmtzolx4u0000g8v66fc8kehy	COMPLETED	cmtzoqwxp000194v6h9r5km2o	2026-09-13 16:27:28.955	2026-09-13 16:29:30.078	121	2026-09-13 16:27:28.955	2026-09-13 16:29:30.101
cmu01ox0h0004p0v6mpz4ofzm	cmu01ol7x0001p0v633u6hy0u	cmtzolx4u0000g8v66fc8kehy	COMPLETED	cmtzoqwxp000194v6h9r5km2o	2026-09-13 16:45:22.337	2026-09-13 16:53:12.484	470	2026-09-13 16:45:22.337	2026-09-13 16:53:12.485
cmu046iq10004ogv6exv5baaa	cmu0467xk0001ogv64qa6ivjz	cmtzolx4u0000g8v66fc8kehy	COMPLETED	cmtzoqwxp000194v6h9r5km2o	2026-09-13 17:55:02.857	2026-09-13 18:05:23.722	620	2026-09-13 17:55:02.857	2026-09-13 18:05:23.725
cmu04u1os000hogv604sk8iub	cmu04tqek000eogv653etou45	cmtzolx4u0000g8v66fc8kehy	COMPLETED	cmtzoqwxp000194v6h9r5km2o	2026-09-13 18:13:20.524	2026-09-13 18:13:25.924	5	2026-09-13 18:13:20.524	2026-09-13 18:13:25.924
cmu052joq000oogv6tbly1mlo	cmu04yatx000logv6v62lzlng	cmtzolx4u0000g8v66fc8kehy	COMPLETED	cmtzoqwxp000194v6h9r5km2o	2026-09-13 18:19:57.098	2026-09-13 19:12:10.996	3133	2026-09-13 18:19:57.098	2026-09-13 19:12:10.998
cmu079rl9001mogv6f7ffxw4w	cmu0796ln001iogv63p2lrjle	cmtzolx4u0000g8v66fc8kehy	COMPLETED	cmtzoqwy0000294v6bc12er39	2026-09-13 19:21:33.165	2026-09-13 19:42:40.664	1267	2026-09-13 19:21:33.165	2026-09-13 19:42:40.668
cmu1aeqkl00045sv64mxtxu13	cmu1aech100015sv6xx6bj2bu	cmtzolx4u0000g8v66fc8kehy	COMPLETED	cmtzoqwxp000194v6h9r5km2o	2026-09-14 13:37:10.149	2026-09-14 14:21:29.693	2659	2026-09-14 13:37:10.149	2026-09-14 14:21:29.694
cmu1dpz5d0004d0v6itpg7950	cmu1dp87w0001d0v6wq8w4z4h	cmtzolx4u0000g8v66fc8kehy	COMPLETED	cmtzoqwxp000194v6h9r5km2o	2026-09-14 15:09:53.329	2026-09-14 15:20:21.184	627	2026-09-14 15:09:53.329	2026-09-14 15:20:21.188
cmu1fnkhq000038v6z1pe65nk	cmu1eeuek0001ygv6vh4t9bbm	cmtzolx4u0000g8v66fc8kehy	COMPLETED	cmtzoqwxp000194v6h9r5km2o	2026-09-14 16:04:00.254	2026-09-14 16:22:20.517	1100	2026-09-14 16:04:00.254	2026-09-14 16:22:20.52
\.


--
-- Data for Name: Job; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Job" (id, title, department, location, description, requirements, status, "recruiterId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: JobQuestion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."JobQuestion" (id, "jobId", "questionId", "order", "createdAt") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Message" (id, "sessionId", "questionId", sender, message, "createdAt") FROM stdin;
cmtzpr8et000274v6k6u5bqjq	cmtzp0ucq000174v6cc1a4fiv	cmtzoqwxp000194v6h9r5km2o	AI	How would you handle the case where there are multiple pairs of numbers that add up to the target?	2026-09-13 11:11:15.029
cmtzps9g8000374v6orhxk8ls	cmtzp0ucq000174v6cc1a4fiv	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	i will run two nested loops and check the sum with target for each pair	2026-09-13 11:12:03.032
cmtzpvy1i000574v6vsvgkjml	cmtzp0ucq000174v6cc1a4fiv	cmtzoqwxp000194v6h9r5km2o	AI	How can we optimize the solution to avoid checking all pairs explicitly, especially for large arrays?	2026-09-13 11:14:54.87
cmtzpyn8h000674v61mt76phx	cmtzp0ucq000174v6cc1a4fiv	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	i can sort array, then take two pointers start and end. stat at 0 and end at length-1 of array, check their sum, if its less than target, move start ahead, if sum is greater than target, move end one step back, if target and sum becomes equal, we return	2026-09-13 11:17:00.833
cmtzq2tas000874v62iv34u5b	cmtzp0ucq000174v6cc1a4fiv	cmtzoqwxp000194v6h9r5km2o	AI	How does the two-pointer approach ensure that we find the correct pair efficiently, especially when the array contains duplicate elements?	2026-09-13 11:20:15.316
cmtzq4dyw000974v6fx30do2s	cmtzp0ucq000174v6cc1a4fiv	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	we check before comparing if start and start+1 are same, then we just move ahead skipping the duplicate element, same goes with end pointer	2026-09-13 11:21:28.76
cmtzqafj6000a74v6y6fnqwj9	cmtzp0ucq000174v6cc1a4fiv	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	we check before comparing if start and start+1 are same, then we just move ahead skipping the duplicate element, same goes with end pointer	2026-09-13 11:26:10.722
cmtzqdwze000d74v6m7qdjb3a	cmtzp0ucq000174v6cc1a4fiv	cmtzoqwy0000294v6bc12er39	AI	How does the two-pointer approach ensure that we find the correct pair efficiently, especially when the array contains duplicate elements?	2026-09-13 11:28:53.306
cmtzt3r4200050sv6i2t4p4yr	cmtzt3f9i00040sv6nq48zssg	cmtzoqwxp000194v6h9r5km2o	AI	How would you optimize the solution if the array contained duplicates?	2026-09-13 12:44:57.986
cmtzt5rht00060sv6ijkwskb4	cmtzt3f9i00040sv6nq48zssg	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	Use a HashMap to store each number and its index. For every number, check if target - number already exists in the map; if yes, you found the pair, otherwise store the current number. It will take o(n) time and O(n) space	2026-09-13 12:46:31.793
cmtzt91r700080sv658i5kd5c	cmtzt3f9i00040sv6nq48zssg	cmtzoqwxp000194v6h9r5km2o	AI	How would you handle the case where the same element is used twice in the array?	2026-09-13 12:49:05.059
cmtztc5x700090sv6nroffhjl	cmtzt3f9i00040sv6nq48zssg	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	Store the current element after checking for its complement, so it can only match with a different index.	2026-09-13 12:51:30.427
cmtztff6u000b0sv6vez1ayg3	cmtzt3f9i00040sv6nq48zssg	cmtzoqwxp000194v6h9r5km2o	AI	How does the approach ensure that each pair is only considered once?	2026-09-13 12:54:02.406
cmtztfy9h000c0sv63k9dukxv	cmtzt3f9i00040sv6nq48zssg	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	We go through the array only once from left to right, so when we find a matching complement, we immediately return the pair.\nSince we never go backward, the same pair cannot be considered again.	2026-09-13 12:54:27.125
cmtzwxq8b0005r0v6oj239g9w	cmtzwugmb0004r0v60vkr35d8	cmtzoqwxp000194v6h9r5km2o	AI	How would you optimize the solution for when the array contains duplicate elements?	2026-09-13 14:32:15.371
cmtzx0x8l0006r0v60p55akdj	cmtzwugmb0004r0v60vkr35d8	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	Use a HashMap to store each number and its index. For every number, check if target - number already exists in the map; if yes, you found the pair, otherwise store the current number. Time: O(n) Space: O(n	2026-09-13 14:34:44.421
cmtzx5y190008r0v6fgqs800c	cmtzwugmb0004r0v60vkr35d8	cmtzoqwxp000194v6h9r5km2o	AI	How does the approach handle cases where the same element is used twice in the array?	2026-09-13 14:38:38.733
cmtzxjvkt000fr0v651ehi4xi	cmtzxjgxd000er0v64lq79eb8	cmtzoqwxp000194v6h9r5km2o	AI	How would you handle the case where there are multiple pairs of numbers that add up to the target value?	2026-09-13 14:49:28.733
cmtzxkz7a000gr0v61s3k49xd	cmtzxjgxd000er0v64lq79eb8	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	Use a HashMap to store each number and its index. For every number, check if target - number already exists in the map; if yes, you found the pair, otherwise store the current number. Time: O(n) Space: O(n)We go through the array only once from left to right, so when we find a matching complement, we immediately return the pair. Since we never go backward, the same pair cannot be considered again.	2026-09-13 14:50:20.086
cmtzxt28b000hr0v6wg3f105l	cmtzxjgxd000er0v64lq79eb8	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	Use a HashMap to store each number and its index. For every number, check if target - number already exists in the map; if yes, you found the pair, otherwise store the current number Time O(n) and Space O(n)	2026-09-13 14:56:37.259
cmu012xd6000nr0v6opyv6ieq	cmu011wsb000mr0v674gp1krd	cmtzoqwxp000194v6h9r5km2o	AI	How would you handle the case where there are multiple pairs of numbers that add up to the target value?	2026-09-13 16:28:16.362
cmu01ox2u0005p0v6p64jscwb	cmu01ox0h0004p0v6mpz4ofzm	cmtzoqwxp000194v6h9r5km2o	AI	Hello! Please begin by explaining how you would approach this problem.	2026-09-13 16:45:22.422
cmu01pg880006p0v6g9v1idmm	cmu01ox0h0004p0v6mpz4ofzm	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	Use a HashMap to store each number and its index. For every number, check if target - number already exists in the map; if yes, you found the pair, otherwise store the current number.\nTime: O(n) Space: O(n)	2026-09-13 16:45:47.24
cmu01svkq0008p0v61bl53ngm	cmu01ox0h0004p0v6mpz4ofzm	cmtzoqwxp000194v6h9r5km2o	AI	How does the use of a hash map ensure that the solution is efficient in terms of time complexity?	2026-09-13 16:48:27.098
cmu01udhw0009p0v6dr1u8m6y	cmu01ox0h0004p0v6mpz4ofzm	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	look up in hashmap is constant and is done for array length hence O(n) is time complexity	2026-09-13 16:49:36.98
cmu01ywjj000bp0v6osspnrgu	cmu01ox0h0004p0v6mpz4ofzm	cmtzoqwxp000194v6h9r5km2o	AI	How does the hash map approach handle cases where the same number appears more than once in the array?	2026-09-13 16:53:08.288
cmu046isn0005ogv6m41bsumt	cmu046iq10004ogv6exv5baaa	cmtzoqwxp000194v6h9r5km2o	AI	Hello! Please begin by explaining how you would approach this problem.	2026-09-13 17:55:02.951
cmu047opa0006ogv66df6c2hw	cmu046iq10004ogv6exv5baaa	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	Use a HashMap to store each number and its index. For every number, check if target - number already exists in the map; if yes, you found the pair, otherwise store the current number. Time O(n) and Space O(n)	2026-09-13 17:55:57.262
cmu04b0ix0008ogv66qiuhu90	cmu046iq10004ogv6exv5baaa	cmtzoqwxp000194v6h9r5km2o	AI	How does the use of a hash map affect the efficiency of solving the Two Sum problem compared to a brute-force approach?	2026-09-13 17:58:32.553
cmu04d7g70009ogv6mzuv9n9f	cmu046iq10004ogv6exv5baaa	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	since the lookup is constant so for entire array it with be o(n) time	2026-09-13 18:00:14.839
cmu04i34c000bogv6q5s7l6mc	cmu046iq10004ogv6exv5baaa	cmtzoqwxp000194v6h9r5km2o	AI	How does the order of processing elements in the array affect the efficiency of the solution?	2026-09-13 18:04:02.508
cmu04u1pk000iogv6vafpj5xf	cmu04u1os000hogv604sk8iub	cmtzoqwxp000194v6h9r5km2o	AI	Hello! Please begin by explaining how you would approach this problem.	2026-09-13 18:13:20.553
cmu052jp8000pogv6vva08aah	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	AI	Hello! Please begin by explaining how you would approach this problem.	2026-09-13 18:19:57.116
cmu052lg2000qogv65h51vss7	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	jiji	2026-09-13 18:19:59.378
cmu056hwc000sogv63oj6tvib	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	AI	How did you decide which approach to take when solving the 'Two Sum' problem?	2026-09-13 18:23:01.404
cmu05o1go000togv6ltq0oyns	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	jkjkj	2026-09-13 18:36:39.912
cmu05r62r000vogv6k3fxzbzd	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	AI	What considerations would you include when implementing your approach to handle potential edge cases, such as duplicate values or empty arrays?	2026-09-13 18:39:05.859
cmu05sbg2000wogv669030cg5	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	duplicates i think	2026-09-13 18:39:59.474
cmu05vhrw000zogv6zqwle1nv	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	AI	How would you handle the case where the same value appears multiple times in the array, as mentioned in your approach?	2026-09-13 18:42:27.644
cmu05wwwb0010ogv6boq467nv	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	how wud ik	2026-09-13 18:43:33.899
cmu060tqo0013ogv6onlccdcl	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	AI	How would you ensure that your approach efficiently handles cases where the target value is achieved by different pairs of numbers?	2026-09-13 18:46:36.433
cmu061ukg0014ogv6sguzc68p	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	zoom	2026-09-13 18:47:24.16
cmu0672ha0017ogv66haqyo90	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	AI	How would you ensure that your approach efficiently handles cases where the target value is achieved by different pairs of numbers?	2026-09-13 18:51:27.694
cmu0681eq0018ogv689mfghlh	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	hello	2026-09-13 18:52:12.962
cmu06bfs40019ogv6kwxpln9g	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	zero	2026-09-13 18:54:51.556
cmu06cs1g001aogv6ng1mwnha	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	dingdong	2026-09-13 18:55:54.1
cmu06dfcr001bogv68fyv2v52	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	ds	2026-09-13 18:56:24.315
cmu06e3eh001cogv6loo18ubi	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	de	2026-09-13 18:56:55.481
cmu06h3ms001dogv6ozarmjiu	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	iugyftds	2026-09-13 18:59:15.748
cmu06if11001eogv6vaa644oi	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	ffffffffffff	2026-09-13 19:00:17.173
cmu06pwwp001fogv6b21ljnu3	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	hgfd	2026-09-13 19:06:06.937
cmu06r658001gogv6nl0bd8z5	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	jhgf	2026-09-13 19:07:05.564
cmu079rmb001nogv6w7zeh81z	cmu079rl9001mogv6f7ffxw4w	cmtzoqwxp000194v6h9r5km2o	AI	Hello! Please begin by explaining how you would approach this problem.	2026-09-13 19:21:33.203
cmu079tll001oogv6aau18cvk	cmu079rl9001mogv6f7ffxw4w	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	njhgtfrd	2026-09-13 19:21:35.769
cmu07coss001qogv6q84sl91r	cmu079rl9001mogv6f7ffxw4w	cmtzoqwxp000194v6h9r5km2o	AI	How would you handle the case where the same element is used twice in the array?	2026-09-13 19:23:49.516
cmu07me41001rogv6pequ05nd	cmu079rl9001mogv6f7ffxw4w	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	ifk	2026-09-13 19:31:22.225
cmu07pl15001togv67zqwnhgz	cmu079rl9001mogv6f7ffxw4w	cmtzoqwxp000194v6h9r5km2o	AI	How would you modify your approach to handle cases where the same element is used twice in the array?	2026-09-13 19:33:51.161
cmu07rg8t001uogv6m4gxoac3	cmu079rl9001mogv6f7ffxw4w	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	jk	2026-09-13 19:35:18.269
cmu07vhir001xogv6sczvqh5g	cmu079rl9001mogv6f7ffxw4w	cmtzoqwy0000294v6bc12er39	AI	How would you ensure that the solution handles cases where the same element appears multiple times in the array?	2026-09-13 19:38:26.547
cmu07vjes001yogv6iyqif5g6	cmu079rl9001mogv6f7ffxw4w	cmtzoqwy0000294v6bc12er39	CANDIDATE	jj	2026-09-13 19:38:28.996
cmu080l200020ogv6h6frkpsc	cmu079rl9001mogv6f7ffxw4w	cmtzoqwy0000294v6bc12er39	AI	How would you ensure that the solution handles cases where the same element appears multiple times in the array?	2026-09-13 19:42:24.408
cmu1aeqna00055sv63ootqr1t	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	AI	Hello! Please begin by explaining how you would approach this problem.	2026-09-14 13:37:10.246
cmu1ahv9s00065sv63m7eyag6	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	use a hashmap to store each number and its index while traversing. for each number check target-number exists in map or not. if it does return the two indices otherwise add in the map. the time complexity will be O(n) and space complexity will be O(n).	2026-09-14 13:39:36.208
cmu1aonpd0000pcv6mg548j7d	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	traverse the array and check for each number target-number, if it is already in hashmap return the indices, otherwise add the number into map	2026-09-14 13:44:52.994
cmu1avi4a0000cgv6ms8cqdr0	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	hashmap O(n) time and O(n) space	2026-09-14 13:50:12.346
cmu1b8brz0001cgv66gol5z55	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	lalalalalalla	2026-09-14 14:00:10.655
cmu1bde830000bsv6jo971p63	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	use a hashmap to store each number and its index while traersing. for each number check target - number exists in the hashmap or not. If it does, return the indices, otherwise add the number in the map. The time complexity will be O(n) and space complexity will be O(n).	2026-09-14 14:04:07.107
cmu1biozr00005cv6t03y6a5g	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	happy birthday	2026-09-14 14:08:14.344
cmu1bjgof0000rov6tne0nag8	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	good	2026-09-14 14:08:50.223
cmu1bk8pr0000mkv6yo6if4ye	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	hello	2026-09-14 14:09:26.559
cmu1bkbuz0001mkv6l6dl8qcg	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	whatttt	2026-09-14 14:09:30.635
cmu1bln3a00005kv6xcguvo7k	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	good morning mumbai	2026-09-14 14:10:31.846
cmu1bq1pt00000ov604fzl33k	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	hello	2026-09-14 14:13:57.425
cmu1bq4kg00010ov6wh8u20nu	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	hhhh	2026-09-14 14:14:01.12
cmu1bw31f0000dov67xbt9j2c	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	use a hashmap to store eah number and its index while traversing. For each number chck target - number exists in the hashmap or not. if it does, return the indices, otherwise add the number in the map. Time o(n) space O(n)	2026-09-14 14:18:39.075
cmu1bw8ek0003dov6mfvcixxm	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	AI	How does your hashmap-based approach handle the situation where the two numbers that sum to the target are the same value (e.g., target is 8 and the array contains two 4s)?	2026-09-14 14:18:46.028
cmu1bx1xo0004dov66qwn1c86	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	we can continue if arr[i] == arr[i+1}	2026-09-14 14:19:24.3
cmu1bx8b10007dov6nmf5qtcl	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	AI	How would you extend your approach to consider pairs of elements that are not adjacent in the array when searching for the target sum?	2026-09-14 14:19:32.557
cmu1bxmab0008dov6fppbirbt	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	we can continue if the taregt-number is there already	2026-09-14 14:19:50.675
cmu1bydwa000bdov6nk07inoe	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	AI	How does your method handle situations where no two numbers in the array sum to the target, or when the array contains duplicate values that could form the required pair?	2026-09-14 14:20:26.458
cmu1bz59v000cdov6a17vrofc	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	then after the loop gets over and we find nothing we can simply return {-1, -1}	2026-09-14 14:21:01.939
cmu1bziax000fdov6r7deeem2	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	AI	How does your approach handle cases where the array contains duplicate numbers that could form the target sum, and how do you ensure you don't mistakenly use the same element twice?	2026-09-14 14:21:18.825
cmu1e2epx0000bkv6ytfvz171	cmu1dpz5d0004d0v6itpg7950	cmtzoqwxp000194v6h9r5km2o	AI	Hello! Please begin by explaining how you would approach this problem.	2026-09-14 15:19:33.381
cmu1fnkk5000138v6efl6bk1s	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	AI	Hello! Please begin by explaining how you would approach this problem.	2026-09-14 16:04:00.341
cmu1fno7o000238v6slw85ql8	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	hello	2026-09-14 16:04:05.076
cmu1fqb5j0000p8v6k6gdcrfg	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	hi	2026-09-14 16:06:08.12
cmu1fqeed0002p8v61g9occwx	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	AI	Can you walk me through how you would approach solving the Two Sum problem?	2026-09-14 16:06:12.325
cmu1fqj5m0003p8v6qq9q85ev	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	no	2026-09-14 16:06:18.49
cmu1fqrjl0006p8v6sdezimsa	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	AI	Can you outline how you would approach finding the two numbers that sum to the target?	2026-09-14 16:06:29.361
cmu1fsbyf0007p8v698ht9ss1	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	ummmmm idk maybe i'll use two loops to test each pair value and chceck its sum against the target	2026-09-14 16:07:42.471
cmu1fsg4e000ap8v63ted24zp	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	AI	What is the time complexity of the double‑loop approach you described, and can you think of a different strategy that might reduce that complexity?	2026-09-14 16:07:47.87
cmu1ft5uw000bp8v66h5tbes0	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	time is	2026-09-14 16:08:21.224
cmu1ft9px000ep8v6ldc5jhgh	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	AI	Can you walk me through the steps and data structures you would use to find the two numbers that add up to the target?	2026-09-14 16:08:26.229
cmu1fu9am000fp8v6dr7wras0	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	time is O(n^2) space is O(1) for double loop approach and in this there is no extra data structure used	2026-09-14 16:09:12.334
cmu1fud9c000ip8v6085u77b6	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	AI	Is there an alternative approach that can improve the time complexity beyond O(n^2), and what data structure would it involve?	2026-09-14 16:09:17.472
cmu1funfm000jp8v641i01tpj	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	hashmap maybe	2026-09-14 16:09:30.658
cmu1fup3c000mp8v6bll7vjm8	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	AI	Can you describe how you would use a hashmap to find the two numbers that sum to the target, and what the time and space complexities of that approach would be?	2026-09-14 16:09:32.808
cmu1fvnoy000np8v6g1uhb8j9	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	i will see if target-number exists in hashmap as value->index pair, if yes then i'll return the indices, if not, i'll add the number to the map	2026-09-14 16:10:17.65
cmu1fvq5x000qp8v6tt6jnu8e	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	AI	What are the time and space complexities of your hashmap-based solution, and why?	2026-09-14 16:10:20.853
cmu1fw3hq000rp8v6f9u0oql9	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	time is O(n) and space is O(n)	2026-09-14 16:10:38.126
cmu1fwrmf000sp8v6g0aj3hze	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	time is o(n0 and space is o(n)	2026-09-14 16:11:09.399
cmu1fyh3a000tp8v6zhabd4km	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	dd	2026-09-14 16:12:29.062
cmu1g74gg00005ov6yra3uzst	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	time is O(n) and space is also O(n)	2026-09-14 16:19:12.592
cmu1g792n00035ov6cywc5xnn	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	AI	Can you explain which data structure you would use to achieve the O(n) time complexity and how it helps you identify the two numbers that sum to the target?	2026-09-14 16:19:18.575
cmu1g8knd00045ov61ljgrvgq	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	hashmap i used and since the lookup is O(1) in average complexity, looking up in entire array makes it O(n) time complexity for an array of length n	2026-09-14 16:20:20.233
cmu1g8pex00075ov6jmjw5zpy	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	AI	Can you explain how your hashmap-based algorithm ensures that it doesn't use the same array element twice when identifying the two numbers that sum to the target?	2026-09-14 16:20:26.409
cmu1gau1r00085ov60dfe3bkb	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	CANDIDATE	as we will store the pairs int target-num and index pair, it will be created once only skipping the duplicates	2026-09-14 16:22:05.727
cmu1gaznw000b5ov6k56q8ksz	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	AI	How does your method handle cases where the two numbers that sum to the target are the same value, such as when the array contains [3, 3] and the target is 6?	2026-09-14 16:22:13.004
\.


--
-- Data for Name: PasswordResetToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PasswordResetToken" (id, "tokenHash", "userId", "expiresAt", "usedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Question" (id, title, difficulty, topics, description, examples, constraints, "createdAt", "updatedAt") FROM stdin;
cmtzolx5c0001g8v64sl5edc1	Two Sum	EASY	{Arrays,"Hash Map"}	Given an array of integers and a target value, find two numbers that add up to the target.	[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0] + nums[1] = 2 + 7 = 9."}]	{"2 <= nums.length <= 10^4","-10^9 <= nums[i] <= 10^9","-10^9 <= target <= 10^9"}	2026-09-13 10:39:07.536	2026-09-13 10:39:07.536
cmtzolx5m0002g8v6tz9pzksu	Longest Substring Without Repeating Characters	MEDIUM	{Strings,"Sliding Window"}	Given a string s, find the length of the longest substring without repeating characters.	[{"input": "s = \\"abcabcbb\\"", "output": "3", "explanation": "The answer is \\"abc\\", with a length of 3."}]	{"0 <= s.length <= 5 * 10^4","s consists of English letters, digits, symbols and spaces."}	2026-09-13 10:39:07.546	2026-09-13 10:39:07.546
cmtzolx630003g8v62g0shmhu	Binary Tree Preorder Traversal	MEDIUM	{Trees,Recursion}	Given the root of a binary tree, return the preorder traversal of its nodes.	[{"input": "root = [1,null,2,3]", "output": "[1,2,3]", "explanation": "Visit the root, then the left subtree, then the right subtree."}]	{"The number of nodes is between 0 and 100.","-100 <= Node.val <= 100"}	2026-09-13 10:39:07.563	2026-09-13 10:39:07.563
cmtzoqwxp000194v6h9r5km2o	Two Sum	EASY	{Arrays,"Hash Map"}	Given an array of integers and a target value, find two numbers that add up to the target.	[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0] + nums[1] = 2 + 7 = 9."}]	{"2 <= nums.length <= 10^4","-10^9 <= nums[i] <= 10^9","-10^9 <= target <= 10^9"}	2026-09-13 10:43:00.541	2026-09-13 10:43:00.541
cmtzoqwy0000294v6bc12er39	Longest Substring Without Repeating Characters	MEDIUM	{Strings,"Sliding Window"}	Given a string s, find the length of the longest substring without repeating characters.	[{"input": "s = \\"abcabcbb\\"", "output": "3", "explanation": "The answer is \\"abc\\", with a length of 3."}]	{"0 <= s.length <= 5 * 10^4","s consists of English letters, digits, symbols and spaces."}	2026-09-13 10:43:00.552	2026-09-13 10:43:00.552
cmtzoqwyb000394v6g8g97buo	Binary Tree Preorder Traversal	MEDIUM	{Trees,Recursion}	Given the root of a binary tree, return the preorder traversal of its nodes.	[{"input": "root = [1,null,2,3]", "output": "[1,2,3]", "explanation": "Visit the root, then the left subtree, then the right subtree."}]	{"The number of nodes is between 0 and 100.","-100 <= Node.val <= 100"}	2026-09-13 10:43:00.563	2026-09-13 10:43:00.563
\.


--
-- Data for Name: QuestionAttempt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."QuestionAttempt" (id, "sessionId", "questionId", "candidateId", status, "startedAt", "completedAt", "createdAt", "updatedAt") FROM stdin;
cmtzpvy0i000474v6gwkk8pfy	cmtzp0ucq000174v6cc1a4fiv	cmtzoqwxp000194v6h9r5km2o	cmtzolx4u0000g8v66fc8kehy	COMPLETED	2026-09-13 11:14:54.834	2026-09-13 11:28:53.284	2026-09-13 11:14:54.834	2026-09-13 11:28:53.286
cmtzt91q300070sv6r8d0jhdc	cmtzt3f9i00040sv6nq48zssg	cmtzoqwxp000194v6h9r5km2o	cmtzolx4u0000g8v66fc8kehy	CURRENT	2026-09-13 12:49:05.019	\N	2026-09-13 12:49:05.019	2026-09-13 12:54:02.355
cmtzx5xxg0007r0v67zngp5i2	cmtzwugmb0004r0v60vkr35d8	cmtzoqwxp000194v6h9r5km2o	cmtzolx4u0000g8v66fc8kehy	CURRENT	2026-09-13 14:38:38.596	\N	2026-09-13 14:38:38.596	2026-09-13 14:38:38.596
cmu01svjd0007p0v63nofqe4a	cmu01ox0h0004p0v6mpz4ofzm	cmtzoqwxp000194v6h9r5km2o	cmtzolx4u0000g8v66fc8kehy	CURRENT	2026-09-13 16:48:27.049	\N	2026-09-13 16:48:27.049	2026-09-13 16:53:08.205
cmu04b0hv0007ogv651upzdrb	cmu046iq10004ogv6exv5baaa	cmtzoqwxp000194v6h9r5km2o	cmtzolx4u0000g8v66fc8kehy	CURRENT	2026-09-13 17:58:32.515	\N	2026-09-13 17:58:32.515	2026-09-13 18:04:02.432
cmu1fqedx0001p8v6eez1pn6d	cmu1fnkhq000038v6z1pe65nk	cmtzoqwxp000194v6h9r5km2o	cmtzolx4u0000g8v66fc8kehy	COMPLETED	2026-09-14 16:06:12.309	2026-09-14 16:22:12.992	2026-09-14 16:06:12.309	2026-09-14 16:22:12.993
cmu056hu8000rogv6xoqmp9je	cmu052joq000oogv6tbly1mlo	cmtzoqwxp000194v6h9r5km2o	cmtzolx4u0000g8v66fc8kehy	COMPLETED	2026-09-13 18:23:01.328	2026-09-13 18:51:27.682	2026-09-13 18:23:01.328	2026-09-13 18:51:27.682
cmu07corn001pogv6eylz1o7q	cmu079rl9001mogv6f7ffxw4w	cmtzoqwxp000194v6h9r5km2o	cmtzolx4u0000g8v66fc8kehy	COMPLETED	2026-09-13 19:23:49.475	2026-09-13 19:38:26.492	2026-09-13 19:23:49.475	2026-09-13 19:38:26.495
cmu080l0v001zogv68044v0ja	cmu079rl9001mogv6f7ffxw4w	cmtzoqwy0000294v6bc12er39	cmtzolx4u0000g8v66fc8kehy	CURRENT	2026-09-13 19:42:24.367	\N	2026-09-13 19:42:24.367	2026-09-13 19:42:24.367
cmu1bw8dx0001dov62iq7858k	cmu1aeqkl00045sv64mxtxu13	cmtzoqwxp000194v6h9r5km2o	cmtzolx4u0000g8v66fc8kehy	COMPLETED	2026-09-14 14:18:46.005	2026-09-14 14:21:18.813	2026-09-14 14:18:46.005	2026-09-14 14:21:18.813
\.


--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RefreshToken" (id, "tokenHash", "userId", "expiresAt", "revokedAt", "createdAt") FROM stdin;
cmtzow4nn00001ov6p4z3dih4	c5d00a42f1b86ae1f9cc75a31abe81d47738edf72588468ec8e1c3e79db25920	cmtzolx4u0000g8v66fc8kehy	2026-09-20 10:47:03.817	\N	2026-09-13 10:47:03.827
cmtzp0miw000074v6q4cy9znm	7c3d16518adc061e64a1a657ddb8d128e08808e1470e51d97d964f6d3691aeb0	cmtzolx4u0000g8v66fc8kehy	2026-09-20 10:50:33.575	\N	2026-09-13 10:50:33.609
cmtzrtmtn0000ocv632iwbii0	8ad6f8edb8afee89d5e2cfb0342a762438915e738e7b3beebe5a0c91b1e57e11	cmtzolx4u0000g8v66fc8kehy	2026-09-20 12:09:06.243	2026-09-13 12:09:30.834	2026-09-13 12:09:06.251
cmtzrvire0001ocv66jo0ntad	af256380903a4a535eb5fddb5283cf8d685f3210982c0e71254523002665e54f	cmtzoqwwv000094v61wx9pb0r	2026-09-20 12:10:34.297	2026-09-13 12:12:40.917	2026-09-13 12:10:34.298
cmtzrybos0002ocv60u9om6y3	f9324640c40c6fc63478c97796519a5f2452762fefebedd08878508545c0df55	cmtzolx4u0000g8v66fc8kehy	2026-09-20 12:12:45.099	2026-09-13 12:43:03.023	2026-09-13 12:12:45.1
cmtzt1eds00000sv63elrepsy	802f888ec992a794a3afc53923e237499af0985981d52aac4fa9d2afceadfa95	cmtzoqwwv000094v61wx9pb0r	2026-09-20 12:43:08.172	2026-09-13 12:44:25.403	2026-09-13 12:43:08.176
cmtzt3cwg00030sv60pykzt9t	523ed9e37f68983c3cc014dadcac99350c358cd999b4b3e4a41036522b7c020d	cmtzolx4u0000g8v66fc8kehy	2026-09-20 12:44:39.567	\N	2026-09-13 12:44:39.568
cmtzwt8370000r0v69nd65a5l	5ba712d01f0ac78217bfa03f1a76098370565547feafecd8f1efcff0da79fa25	cmtzoqwwv000094v61wx9pb0r	2026-09-20 14:28:45.211	2026-09-13 14:29:34.695	2026-09-13 14:28:45.236
cmtzwudno0003r0v6v7gi0o7q	daee304e2121ee092cd7fd1fdcbfee438e6e0d4f4c04be6fce15b2bfa246488e	cmtzolx4u0000g8v66fc8kehy	2026-09-20 14:29:39.107	2026-09-13 14:47:58.358	2026-09-13 14:29:39.108
cmtzxi175000ar0v6r3p48v6a	72959e297fa86ec849615cd33fc474c9cf5ad7a83b4bf890039f2c7a10e02855	cmtzoqwwv000094v61wx9pb0r	2026-09-20 14:48:02.704	2026-09-13 14:48:45.755	2026-09-13 14:48:02.705
cmtzxj2hv000dr0v63hejkdvx	4d6f36786809f9ec875b21c3989b3c75d6baa93da5d6d05dd0297ff6f6ba45c0	cmtzolx4u0000g8v66fc8kehy	2026-09-20 14:48:51.042	2026-09-13 16:20:08.845	2026-09-13 14:48:51.043
cmu00smm9000ir0v6ieh48r46	231fe68cf9b1cfc5166a560bb7eb3712d5712ce00e499048fe3bcfa7466e5e81	cmtzoqwwv000094v61wx9pb0r	2026-09-20 16:20:15.872	2026-09-13 16:21:27.651	2026-09-13 16:20:15.874
cmu00u9mg000lr0v65oot0vf1	59623e8182a74c1a4c2dfdefeafc6587ba87fa8266b1ebd90f1133f25d287906	cmtzolx4u0000g8v66fc8kehy	2026-09-20 16:21:32.344	\N	2026-09-13 16:21:32.344
cmu01npuy0000p0v664iafkhu	c568381c3870e941535353eff335a89214acff7cdfeab9cab8999fdc914ff4ff	cmtzoqwwv000094v61wx9pb0r	2026-09-20 16:44:26.335	2026-09-13 16:45:10.705	2026-09-13 16:44:26.413
cmu01orb10003p0v6bcysxdh5	df69089db1d1d40706a74b58e8af269d09355eb468ed241c18799748d8380dfb	cmtzolx4u0000g8v66fc8kehy	2026-09-20 16:45:14.94	\N	2026-09-13 16:45:14.941
cmu045kwb0000ogv694q9luto	b63c9e9f53fc9e697bc292a44dbd56b39fae4e0d6cfb071ca1440b617b31a52e	cmtzoqwwv000094v61wx9pb0r	2026-09-20 17:54:19.008	2026-09-13 17:54:51.846	2026-09-13 17:54:19.019
cmu046fdp0003ogv6bfp4asfo	36ce750733d97deba23057eb7863c3fd539fb00b6a2b685b195ccc7498928498	cmtzolx4u0000g8v66fc8kehy	2026-09-20 17:54:58.525	\N	2026-09-13 17:54:58.525
cmu04sz1h000dogv6qw1pq9f7	a0064046ed90d6c29dabf269590a47aaa337d73e12de71785163e5ba38817cd7	cmtzoqwwv000094v61wx9pb0r	2026-09-20 18:12:30.431	2026-09-13 18:13:08.836	2026-09-13 18:12:30.437
cmu04twjr000gogv6hhhlk70j	482719cf3527ec21d8a5df726bcfe89c3c264e91b8490bd5947f4899194a2487	cmtzolx4u0000g8v66fc8kehy	2026-09-20 18:13:13.863	2026-09-13 18:15:52.642	2026-09-13 18:13:13.863
cmu04xe9m000kogv6id4nisi1	9822ecd4c514cc7295d90dd04487fa5b928eaecd5f178d0c66f2915a9bb4ffea	cmtzoqwwv000094v61wx9pb0r	2026-09-20 18:15:56.794	2026-09-13 18:16:42.272	2026-09-13 18:15:56.794
cmu04yhou000nogv64esuxxkx	7f138c32f190cfc85f9e0ffa2ec2d732ebeb2c2749a9efff37ee984eb1f3c7b4	cmtzolx4u0000g8v66fc8kehy	2026-09-20 18:16:47.886	2026-09-13 19:20:16.545	2026-09-13 18:16:47.886
cmu078864001hogv67av6a9db	ca8e5aec6a63b0cdbe103a6346f8d3113e43992584194138ff235a3d4272f601	cmtzoqwwv000094v61wx9pb0r	2026-09-20 19:20:21.337	2026-09-13 19:21:13.778	2026-09-13 19:20:21.34
cmu079kdf001logv6zrtf8f8r	f271c7bd064215954fb5796f130a5500a20c8f6312b41aafa414c4198c2b99b6	cmtzolx4u0000g8v66fc8kehy	2026-09-20 19:21:23.81	\N	2026-09-13 19:21:23.811
cmu1adqj400005sv6b2bh7gll	1a7dba938a4fc687ef0ef8b6d97697335221e0d3ae15a3f6156bc4d000fa6497	cmtzoqwwv000094v61wx9pb0r	2026-09-21 13:36:23.428	2026-09-14 13:36:55.265	2026-09-14 13:36:23.44
cmu1aej0j00035sv69s8lf945	2874e0c08e4be603a2698babc5979e0d03bad0635743ed67c6df713719b33638	cmtzolx4u0000g8v66fc8kehy	2026-09-21 13:37:00.355	2026-09-14 14:38:18.767	2026-09-14 13:37:00.355
cmu1cliao000hdov64xyuhrfd	bbca9f8cace42d5e4dff6c18c2aa5e356358eaca00f6fb91740c1f971350f296	cmtzoqwwv000094v61wx9pb0r	2026-09-21 14:38:25.247	\N	2026-09-14 14:38:25.248
cmu1dokz60000d0v6g1klfvpl	71b79b38927c5a781771e666d6a5423496db5743ffac9c8f8ed33674de0645ce	cmtzoqwwv000094v61wx9pb0r	2026-09-21 15:08:48.295	2026-09-14 15:09:39.666	2026-09-14 15:08:48.306
cmu1dpsol0003d0v68nkfcylq	3e5a96c573957ec25632bfed2ce0087081b039b09c23b681c34d95486d0ef932	cmtzolx4u0000g8v66fc8kehy	2026-09-21 15:09:44.949	2026-09-14 15:28:37.138	2026-09-14 15:09:44.95
cmu1ee51z0000ygv6xvkgqndf	0634f5566c8496379188b98eefae955febd5057846f66bf3659607ab37e361cc	cmtzoqwwv000094v61wx9pb0r	2026-09-21 15:28:40.723	2026-09-14 15:29:17.885	2026-09-14 15:28:40.727
cmu1ef10f0003ygv6uqbobn98	223d3ca61c9aa0f65d716b54454cb6f689b66e60ea4fe69e1516c1a6bf79a112	cmtzolx4u0000g8v66fc8kehy	2026-09-21 15:29:22.143	2026-09-14 15:34:53.944	2026-09-14 15:29:22.143
cmu1em7tw0000cgv60oe6vrml	ec16e4ab83538e06bd1e8bee423608abc0da91f65231df62474b5556448b2276	cmtzoqwwv000094v61wx9pb0r	2026-09-21 15:34:57.565	2026-09-14 15:37:04.101	2026-09-14 15:34:57.572
cmu1ep0ss0005cgv6g56hswbn	f686cec8c6f0db69dfb1bf86a75e797f3ecdb1de5ec08c54e6d0aff37330fdc2	cmtzolx4u0000g8v66fc8kehy	2026-09-21 15:37:08.428	\N	2026-09-14 15:37:08.428
cmu1fa9ps0000rcv6lcqa2ae0	7a1673b558e18aae6137253ab01523e9fe146b02c17c75c8dcf55bcb33ac5cba	cmtzolx4u0000g8v66fc8kehy	2026-09-21 15:53:39.746	2026-09-14 16:28:09.515	2026-09-14 15:53:39.76
cmu1gm6v0000e5ov68bzuwo34	e462665d0e12f2d3df3e79d47c5a90ecaf0055fea1d1845eea13ebfbed6c2d64	cmu1gm6l4000d5ov6h6ostlu6	2026-09-21 16:30:55.547	2026-09-14 16:31:28.928	2026-09-14 16:30:55.548
cmu1gn0x0000f5ov60dbul6c0	0318ef4e6d75b1f6828dd8ea7eeb68c622625dd6dda49d3c58453e9ce4ae33fb	cmtzoqwwv000094v61wx9pb0r	2026-09-21 16:31:34.499	2026-09-14 16:32:39.693	2026-09-14 16:31:34.5
cmu1goj8w000g5ov6zz2li8o9	aae4b3a7a030c426ea3045f90f1e4b64462f67983f9ad0ca68219fb02857762c	cmtzoqwwv000094v61wx9pb0r	2026-09-21 16:32:44.912	2026-09-14 16:34:12.126	2026-09-14 16:32:44.912
cmu1gqfyz000h5ov6oxjbjy4m	12d4d06891e755fa1ece82ebf9a6f06f3e7c61a510d3005a853bcfeab8cb6df4	cmtzoqwwv000094v61wx9pb0r	2026-09-21 16:34:13.979	2026-09-14 16:37:05.771	2026-09-14 16:34:13.979
cmu1gu5md000i5ov6d1103efb	cf9b10d23c1d14785dbcda6f36133b659709ad3fa474e29121dd1442744dd26a	cmtzoqwwv000094v61wx9pb0r	2026-09-21 16:37:07.188	2026-09-14 16:47:24.971	2026-09-14 16:37:07.189
cmu1h7fi0000j5ov63huzyob7	02ad23d6a222fdb135a9a2332837d4df21ce1c0079cb35213acc5faf9c90f032	cmtzoqwwv000094v61wx9pb0r	2026-09-21 16:47:26.52	\N	2026-09-14 16:47:26.52
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "firstName", "lastName", email, "passwordHash", role, "emailVerified", "isActive", "createdAt", "updatedAt") FROM stdin;
cmtzolx4u0000g8v66fc8kehy	Anjali	Dass	candidate@example.com	$2b$10$zlUphQOoA8uqtDYK0ZgMnuHk1sGwdZanAbjyr/6FgHxPgCuGuI5Tm	CANDIDATE	t	t	2026-09-13 10:39:07.518	2026-09-13 10:39:07.518
cmtzoqwwv000094v61wx9pb0r	Test	Recruiter	recruiter@example.com	$2b$10$iy1M69WOd4Gk5Kc0254njusCFr4NdVfg2RrIDOKCuFGyoUJLlHFOW	RECRUITER	t	t	2026-09-13 10:43:00.511	2026-09-13 10:43:00.511
cmu1gm6l4000d5ov6h6ostlu6	Janvi	Behal	candidate_2@example.com	$2b$12$lNXA9sbDHLbKEfQRvSuE2eypKn1.zF/Eyf.w0YyZOsI6memqbpv3a	CANDIDATE	f	t	2026-09-14 16:30:55.192	2026-09-14 16:30:55.192
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
7324a9bf-3887-4759-912e-8e02cbf389d9	548bbe4922c6ac59c518301e70e51224ca4bd2859509843468eee89cbdc7e375	2026-09-14 13:33:40.129398+00	20260902194733_init		\N	2026-09-14 13:33:40.129398+00	0
c076d1a0-b0cb-4aa7-b2be-b653acf0b00b	373274c523569ba7afd89bdf6cda4ded66dd073919c57e6f5940541b076ee357	2026-09-14 13:33:49.729066+00	20260911095738_candidate_interview_flow		\N	2026-09-14 13:33:49.729066+00	0
b339eb7d-94b9-4b22-9da6-520b9e738efc	cbb8dd68cff264533a16de0ff6ef80dadc141ceedf2f2b741a905c99256d06fd	2026-09-14 13:34:05.189836+00	20260911185834_add_job_models		\N	2026-09-14 13:34:05.189836+00	0
\.


--
-- Name: EmailVerificationToken EmailVerificationToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailVerificationToken"
    ADD CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY (id);


--
-- Name: Evaluation Evaluation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evaluation"
    ADD CONSTRAINT "Evaluation_pkey" PRIMARY KEY (id);


--
-- Name: InterviewQuestion InterviewQuestion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InterviewQuestion"
    ADD CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY (id);


--
-- Name: InterviewSession InterviewSession_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InterviewSession"
    ADD CONSTRAINT "InterviewSession_pkey" PRIMARY KEY (id);


--
-- Name: Interview Interview_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Interview"
    ADD CONSTRAINT "Interview_pkey" PRIMARY KEY (id);


--
-- Name: JobQuestion JobQuestion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."JobQuestion"
    ADD CONSTRAINT "JobQuestion_pkey" PRIMARY KEY (id);


--
-- Name: Job Job_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Job"
    ADD CONSTRAINT "Job_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: PasswordResetToken PasswordResetToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY (id);


--
-- Name: QuestionAttempt QuestionAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionAttempt"
    ADD CONSTRAINT "QuestionAttempt_pkey" PRIMARY KEY (id);


--
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- Name: RefreshToken RefreshToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: EmailVerificationToken_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmailVerificationToken_expiresAt_idx" ON public."EmailVerificationToken" USING btree ("expiresAt");


--
-- Name: EmailVerificationToken_tokenHash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON public."EmailVerificationToken" USING btree ("tokenHash");


--
-- Name: EmailVerificationToken_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmailVerificationToken_userId_idx" ON public."EmailVerificationToken" USING btree ("userId");


--
-- Name: Evaluation_candidateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Evaluation_candidateId_idx" ON public."Evaluation" USING btree ("candidateId");


--
-- Name: Evaluation_interviewId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Evaluation_interviewId_key" ON public."Evaluation" USING btree ("interviewId");


--
-- Name: Evaluation_sessionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Evaluation_sessionId_key" ON public."Evaluation" USING btree ("sessionId");


--
-- Name: InterviewQuestion_interviewId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InterviewQuestion_interviewId_idx" ON public."InterviewQuestion" USING btree ("interviewId");


--
-- Name: InterviewQuestion_interviewId_questionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "InterviewQuestion_interviewId_questionId_key" ON public."InterviewQuestion" USING btree ("interviewId", "questionId");


--
-- Name: InterviewQuestion_questionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InterviewQuestion_questionId_idx" ON public."InterviewQuestion" USING btree ("questionId");


--
-- Name: InterviewSession_candidateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InterviewSession_candidateId_idx" ON public."InterviewSession" USING btree ("candidateId");


--
-- Name: InterviewSession_interviewId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "InterviewSession_interviewId_key" ON public."InterviewSession" USING btree ("interviewId");


--
-- Name: InterviewSession_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InterviewSession_status_idx" ON public."InterviewSession" USING btree (status);


--
-- Name: Interview_candidateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Interview_candidateId_idx" ON public."Interview" USING btree ("candidateId");


--
-- Name: Interview_recruiterId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Interview_recruiterId_idx" ON public."Interview" USING btree ("recruiterId");


--
-- Name: Interview_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Interview_status_idx" ON public."Interview" USING btree (status);


--
-- Name: JobQuestion_jobId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "JobQuestion_jobId_idx" ON public."JobQuestion" USING btree ("jobId");


--
-- Name: JobQuestion_jobId_questionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "JobQuestion_jobId_questionId_key" ON public."JobQuestion" USING btree ("jobId", "questionId");


--
-- Name: JobQuestion_questionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "JobQuestion_questionId_idx" ON public."JobQuestion" USING btree ("questionId");


--
-- Name: Job_recruiterId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Job_recruiterId_idx" ON public."Job" USING btree ("recruiterId");


--
-- Name: Job_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Job_status_idx" ON public."Job" USING btree (status);


--
-- Name: Message_questionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Message_questionId_idx" ON public."Message" USING btree ("questionId");


--
-- Name: Message_sessionId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Message_sessionId_createdAt_idx" ON public."Message" USING btree ("sessionId", "createdAt");


--
-- Name: Message_sessionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Message_sessionId_idx" ON public."Message" USING btree ("sessionId");


--
-- Name: PasswordResetToken_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PasswordResetToken_expiresAt_idx" ON public."PasswordResetToken" USING btree ("expiresAt");


--
-- Name: PasswordResetToken_tokenHash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON public."PasswordResetToken" USING btree ("tokenHash");


--
-- Name: PasswordResetToken_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PasswordResetToken_userId_idx" ON public."PasswordResetToken" USING btree ("userId");


--
-- Name: QuestionAttempt_candidateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "QuestionAttempt_candidateId_idx" ON public."QuestionAttempt" USING btree ("candidateId");


--
-- Name: QuestionAttempt_questionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "QuestionAttempt_questionId_idx" ON public."QuestionAttempt" USING btree ("questionId");


--
-- Name: QuestionAttempt_sessionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "QuestionAttempt_sessionId_idx" ON public."QuestionAttempt" USING btree ("sessionId");


--
-- Name: QuestionAttempt_sessionId_questionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "QuestionAttempt_sessionId_questionId_key" ON public."QuestionAttempt" USING btree ("sessionId", "questionId");


--
-- Name: Question_difficulty_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Question_difficulty_idx" ON public."Question" USING btree (difficulty);


--
-- Name: RefreshToken_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RefreshToken_expiresAt_idx" ON public."RefreshToken" USING btree ("expiresAt");


--
-- Name: RefreshToken_tokenHash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON public."RefreshToken" USING btree ("tokenHash");


--
-- Name: RefreshToken_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RefreshToken_userId_idx" ON public."RefreshToken" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_isActive_idx" ON public."User" USING btree ("isActive");


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: EmailVerificationToken EmailVerificationToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailVerificationToken"
    ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Evaluation Evaluation_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evaluation"
    ADD CONSTRAINT "Evaluation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Evaluation Evaluation_interviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evaluation"
    ADD CONSTRAINT "Evaluation_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES public."Interview"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Evaluation Evaluation_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Evaluation"
    ADD CONSTRAINT "Evaluation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."InterviewSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InterviewQuestion InterviewQuestion_interviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InterviewQuestion"
    ADD CONSTRAINT "InterviewQuestion_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES public."Interview"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InterviewQuestion InterviewQuestion_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InterviewQuestion"
    ADD CONSTRAINT "InterviewQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InterviewSession InterviewSession_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InterviewSession"
    ADD CONSTRAINT "InterviewSession_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InterviewSession InterviewSession_interviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InterviewSession"
    ADD CONSTRAINT "InterviewSession_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES public."Interview"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Interview Interview_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Interview"
    ADD CONSTRAINT "Interview_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Interview Interview_recruiterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Interview"
    ADD CONSTRAINT "Interview_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JobQuestion JobQuestion_jobId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."JobQuestion"
    ADD CONSTRAINT "JobQuestion_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public."Job"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JobQuestion JobQuestion_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."JobQuestion"
    ADD CONSTRAINT "JobQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Job Job_recruiterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Job"
    ADD CONSTRAINT "Job_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Message Message_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."InterviewSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PasswordResetToken PasswordResetToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuestionAttempt QuestionAttempt_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionAttempt"
    ADD CONSTRAINT "QuestionAttempt_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuestionAttempt QuestionAttempt_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionAttempt"
    ADD CONSTRAINT "QuestionAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuestionAttempt QuestionAttempt_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionAttempt"
    ADD CONSTRAINT "QuestionAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."InterviewSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RefreshToken RefreshToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict oSxeWpic4ffcnzFezM4MRQTfbC6htnuBci2tasDbvSAclUmevLJ3mgEEDmh7Les

