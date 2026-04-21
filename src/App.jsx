import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
//  시간표 데이터 — 엑셀 파일 기반 (도착 시간 우선, 없으면 출발 시간)
// ═══════════════════════════════════════════════════════════════
const TIMETABLE = {
  weekday: {
    up: [
      {id:"K1702",times:{경산:null,동대구:"05:25",대구:"05:30",서대구:"05:36",왜관:"05:52",북삼:"06:02",사곡:"06:07",구미:"06:13"}},
      {id:"K1704",times:{경산:"05:30",동대구:"05:41",대구:"05:47",서대구:"05:53",왜관:"06:09",북삼:"06:19",사곡:"06:24",구미:"06:30"}},
      {id:"K1706",times:{경산:null,동대구:"05:55",대구:"06:00",서대구:"06:06",왜관:"06:22",북삼:"06:32",사곡:"06:37",구미:"06:43"}},
      {id:"K1708",times:{경산:"05:57",동대구:"06:08",대구:"06:14",서대구:"06:20",왜관:"06:36",북삼:"06:46",사곡:"06:51",구미:"06:57"}},
      {id:"K1710",times:{경산:"06:07",동대구:"06:18",대구:"06:24",서대구:"06:30",왜관:"06:46",북삼:"06:56",사곡:"07:01",구미:"07:07"}},
      {id:"K1712",times:{경산:"06:36",동대구:"06:47",대구:"06:53",서대구:"06:59",왜관:"07:15",북삼:"07:25",사곡:"07:30",구미:"07:36"}},
      {id:"K1714",times:{경산:"06:45",동대구:"06:56",대구:"07:02",서대구:"07:08",왜관:"07:24",북삼:"07:34",사곡:"07:39",구미:"07:45"}},
      {id:"K1716",times:{경산:"07:10",동대구:"07:21",대구:"07:27",서대구:"07:33",왜관:"07:49",북삼:"07:59",사곡:"08:04",구미:"08:10"}},
      {id:"K1718",times:{경산:"07:34",동대구:"07:45",대구:"07:51",서대구:"07:57",왜관:"08:13",북삼:"08:23",사곡:"08:28",구미:"08:34"}},
      {id:"K1720",times:{경산:"07:57",동대구:"08:08",대구:"08:13",서대구:"08:19",왜관:"08:36",북삼:"08:45",사곡:"08:51",구미:"08:57"}},
      {id:"K1722",times:{경산:"08:08",동대구:"08:19",대구:"08:25",서대구:"08:31",왜관:"08:47",북삼:"08:57",사곡:"09:02",구미:"09:08"}},
      {id:"K1724",times:{경산:"08:27",동대구:"08:38",대구:"08:44",서대구:"08:50",왜관:"09:06",북삼:"09:16",사곡:"09:21",구미:"09:27"}},
      {id:"K1726",times:{경산:"08:42",동대구:"08:53",대구:"08:59",서대구:"09:05",왜관:"09:21",북삼:"09:31",사곡:"09:36",구미:"09:42"}},
      {id:"K1728",times:{경산:"08:58",동대구:"09:09",대구:"09:15",서대구:"09:21",왜관:"09:37",북삼:"09:47",사곡:"09:52",구미:"09:58"}},
      {id:"K1730",times:{경산:"09:38",동대구:"09:49",대구:"09:55",서대구:"10:01",왜관:"10:17",북삼:"10:27",사곡:"10:32",구미:"10:38"}},
      {id:"K1732",times:{경산:"10:06",동대구:"10:17",대구:"10:23",서대구:"10:29",왜관:"10:45",북삼:"10:55",사곡:"11:00",구미:"11:06"}},
      {id:"K1734",times:{경산:"10:28",동대구:"10:39",대구:"10:45",서대구:"10:51",왜관:"11:07",북삼:"11:17",사곡:"11:22",구미:"11:28"}},
      {id:"K1736",times:{경산:"10:50",동대구:"11:01",대구:"11:07",서대구:"11:13",왜관:"11:29",북삼:"11:39",사곡:"11:44",구미:"11:50"}},
      {id:"K1738",times:{경산:"11:20",동대구:"11:31",대구:"11:37",서대구:"11:43",왜관:"11:59",북삼:"12:09",사곡:"12:14",구미:"12:20"}},
      {id:"K1740",times:{경산:"11:34",동대구:"11:45",대구:"11:51",서대구:"11:57",왜관:"12:13",북삼:"12:27",사곡:"12:33",구미:"12:39"}},
      {id:"K1744",times:{경산:"12:52",동대구:"13:03",대구:"13:09",서대구:"13:15",왜관:"13:31",북삼:"13:41",사곡:"13:46",구미:"13:52"}},
      {id:"K1746",times:{경산:"13:29",동대구:"13:40",대구:"13:46",서대구:"13:52",왜관:"14:08",북삼:"14:18",사곡:"14:23",구미:"14:29"}},
      {id:"K1748",times:{경산:null,동대구:"14:19",대구:"14:24",서대구:"14:30",왜관:"14:46",북삼:"14:56",사곡:"15:01",구미:"15:07"}},
      {id:"K1750",times:{경산:"14:34",동대구:"14:45",대구:"14:51",서대구:"14:57",왜관:"15:13",북삼:"15:23",사곡:"15:28",구미:"15:34"}},
      {id:"K1752",times:{경산:"14:44",동대구:"14:55",대구:"15:01",서대구:"15:07",왜관:"15:23",북삼:"15:39",사곡:"15:44",구미:"15:50"}},
      {id:"K1754",times:{경산:"15:10",동대구:"15:21",대구:"15:27",서대구:"15:33",왜관:"15:49",북삼:"15:59",사곡:"16:04",구미:"16:10"}},
      {id:"K1756",times:{경산:"15:41",동대구:"15:52",대구:"15:58",서대구:"16:04",왜관:"16:20",북삼:"16:30",사곡:"16:35",구미:"16:46"}},
      {id:"K1758",times:{경산:"16:12",동대구:"16:23",대구:"16:29",서대구:"16:35",왜관:"16:51",북삼:"17:01",사곡:"17:06",구미:"17:12"}},
      {id:"K1760",times:{경산:"16:32",동대구:"16:43",대구:"16:49",서대구:"16:55",왜관:"17:11",북삼:"17:21",사곡:"17:26",구미:"17:37"}},
      {id:"K1762",times:{경산:"16:57",동대구:"17:08",대구:"17:14",서대구:"17:20",왜관:"17:36",북삼:"17:46",사곡:"17:51",구미:"17:57"}},
      {id:"K1764",times:{경산:"17:11",동대구:"17:22",대구:"17:30",서대구:"17:36",왜관:"17:52",북삼:"18:06",사곡:"18:12",구미:"18:18"}},
      {id:"K1766",times:{경산:"17:35",동대구:"17:46",대구:"17:52",서대구:"17:58",왜관:"18:14",북삼:"18:24",사곡:"18:29",구미:"18:35"}},
      {id:"K1768",times:{경산:"17:57",동대구:"18:08",대구:"18:14",서대구:"18:20",왜관:"18:36",북삼:"18:50",사곡:"18:56",구미:"19:02"}},
      {id:"K1770",times:{경산:"18:21",동대구:"18:32",대구:"18:38",서대구:"18:44",왜관:"19:00",북삼:"19:10",사곡:"19:15",구미:"19:26"}},
      {id:"K1772",times:{경산:"18:47",동대구:"18:58",대구:"19:04",서대구:"19:10",왜관:"19:26",북삼:"19:36",사곡:"19:41",구미:"19:47"}},
      {id:"K1774",times:{경산:"19:13",동대구:"19:24",대구:"19:30",서대구:"19:36",왜관:"19:52",북삼:"20:02",사곡:"20:07",구미:"20:13"}},
      {id:"K1776",times:{경산:"19:45",동대구:"19:56",대구:"20:02",서대구:"20:08",왜관:"20:24",북삼:"20:34",사곡:"20:39",구미:"20:45"}},
      {id:"K1778",times:{경산:"20:06",동대구:"20:17",대구:"20:22",서대구:"20:28",왜관:"20:45",북삼:"20:54",사곡:"21:00",구미:"21:06"}},
      {id:"K1780",times:{경산:"20:31",동대구:"20:42",대구:"20:48",서대구:"20:54",왜관:"21:10",북삼:"21:20",사곡:"21:25",구미:"21:31"}},
      {id:"K1782",times:{경산:"20:51",동대구:"21:02",대구:"21:08",서대구:"21:14",왜관:"21:30",북삼:"21:40",사곡:"21:45",구미:"21:51"}},
      {id:"K1784",times:{경산:"21:14",동대구:"21:25",대구:"21:31",서대구:"21:37",왜관:"21:53",북삼:"22:03",사곡:"22:08",구미:"22:14"}},
      {id:"K1786",times:{경산:"21:44",동대구:"21:55",대구:"22:01",서대구:"22:07",왜관:"22:23",북삼:"22:33",사곡:"22:38",구미:"22:44"}},
      {id:"K1788",times:{경산:"22:10",동대구:"22:21",대구:"22:27",서대구:"22:33",왜관:"22:49",북삼:"22:59",사곡:"23:04",구미:"23:10"}},
      {id:"K1790",times:{경산:"22:37",동대구:"22:48",대구:"22:54",서대구:"23:00",왜관:"23:16",북삼:"23:26",사곡:"23:31",구미:"23:37"}},
      {id:"K1792",times:{경산:"22:56",동대구:"23:07",대구:"23:12",서대구:"23:18",왜관:"23:35",북삼:"23:44",사곡:"23:50",구미:"23:56"}},
      {id:"K1794",times:{경산:"23:19",동대구:"23:30",대구:"23:36",서대구:"23:42",왜관:"23:58",북삼:"00:08",사곡:"00:13",구미:"00:19"}},
      {id:"K1796",times:{경산:"23:39",동대구:"23:50",대구:"23:55",서대구:"00:01",왜관:"00:18",북삼:"00:27",사곡:"00:33",구미:"00:39"}},
    ],
    down: [
      {id:"K1701",times:{구미:null,사곡:null,북삼:null,왜관:null,서대구:null,대구:null,동대구:"05:35",경산:"05:46"}},
      {id:"K1705",times:{구미:"05:30",사곡:"05:35",북삼:"05:41",왜관:"05:50",서대구:"06:07",대구:"06:13",동대구:"06:18",경산:"06:30"}},
      {id:"K1703",times:{구미:null,사곡:null,북삼:null,왜관:null,서대구:null,대구:null,동대구:"05:49",경산:"06:00"}},
      {id:"K1707",times:{구미:"05:39",사곡:"05:44",북삼:"05:50",왜관:"05:59",서대구:"06:16",대구:"06:22",동대구:"06:27",경산:"06:39"}},
      {id:"K1709",times:{구미:"06:04",사곡:"06:09",북삼:"06:15",왜관:"06:24",서대구:"06:41",대구:"06:47",동대구:"06:52",경산:"07:04"}},
      {id:"K1711",times:{구미:"06:26",사곡:"06:31",북삼:"06:37",왜관:"06:46",서대구:"07:03",대구:"07:09",동대구:"07:14",경산:"07:26"}},
      {id:"K1713",times:{구미:"06:49",사곡:"06:54",북삼:"07:00",왜관:"07:09",서대구:"07:26",대구:"07:32",동대구:"07:37",경산:"07:50"}},
      {id:"K1715",times:{구미:"07:02",사곡:"07:07",북삼:"07:13",왜관:"07:22",서대구:"07:39",대구:"07:45",동대구:"07:50",경산:"08:02"}},
      {id:"K1717",times:{구미:"07:21",사곡:"07:26",북삼:"07:32",왜관:"07:41",서대구:"07:58",대구:"08:04",동대구:"08:09",경산:"08:21"}},
      {id:"K1719",times:{구미:"07:30",사곡:"07:35",북삼:"07:41",왜관:"07:50",서대구:"08:07",대구:"08:13",동대구:"08:18",경산:"08:30"}},
      {id:"K1721",times:{구미:"07:50",사곡:"07:55",북삼:"08:01",왜관:"08:10",서대구:"08:27",대구:"08:33",동대구:"08:38",경산:"08:50"}},
      {id:"K1723",times:{구미:"08:05",사곡:"08:10",북삼:"08:16",왜관:"08:25",서대구:"08:42",대구:"08:48",동대구:"08:53",경산:null}},
      {id:"K1725",times:{구미:"08:20",사곡:"08:25",북삼:"08:31",왜관:"08:40",서대구:"08:57",대구:"09:03",동대구:"09:08",경산:"09:20"}},
      {id:"K1727",times:{구미:"08:44",사곡:"08:49",북삼:"08:55",왜관:"09:04",서대구:"09:21",대구:"09:27",동대구:"09:32",경산:"09:44"}},
      {id:"K1729",times:{구미:"09:08",사곡:"09:13",북삼:"09:23",왜관:"09:33",서대구:"09:49",대구:"09:55",동대구:"10:01",경산:"10:13"}},
      {id:"K1731",times:{구미:"09:22",사곡:"09:27",북삼:"09:33",왜관:"09:47",서대구:"10:03",대구:"10:09",동대구:"10:15",경산:null}},
      {id:"K1733",times:{구미:"09:40",사곡:"09:45",북삼:"09:51",왜관:"10:00",서대구:"10:17",대구:"10:23",동대구:"10:28",경산:"10:40"}},
      {id:"K1735",times:{구미:"10:00",사곡:"10:05",북삼:"10:15",왜관:"10:25",서대구:"10:41",대구:"10:47",동대구:"10:53",경산:"11:05"}},
      {id:"K1737",times:{구미:"10:25",사곡:"10:30",북삼:"10:36",왜관:"10:45",서대구:"11:02",대구:"11:08",동대구:"11:13",경산:"11:25"}},
      {id:"K1739",times:{구미:"10:56",사곡:"11:01",북삼:"11:07",왜관:"11:16",서대구:"11:33",대구:"11:39",동대구:"11:44",경산:null}},
      {id:"K1741",times:{구미:"11:15",사곡:"11:20",북삼:"11:26",왜관:"11:35",서대구:"11:52",대구:"11:58",동대구:"12:03",경산:null}},
      {id:"K1743",times:{구미:"11:38",사곡:"11:43",북삼:"11:49",왜관:"11:58",서대구:"12:19",대구:"12:25",동대구:"12:30",경산:"12:42"}},
      {id:"K1745",times:{구미:"11:59",사곡:"12:04",북삼:"12:10",왜관:"12:19",서대구:"12:40",대구:"12:46",동대구:"12:52",경산:"13:04"}},
      {id:"K1749",times:{구미:"13:21",사곡:"13:26",북삼:"13:36",왜관:"13:46",서대구:"14:02",대구:"14:08",동대구:"14:14",경산:"14:25"}},
      {id:"K1751",times:{구미:"13:34",사곡:"13:39",북삼:"13:45",왜관:"13:54",서대구:"14:15",대구:"14:21",동대구:"14:27",경산:"14:39"}},
      {id:"K1753",times:{구미:"14:03",사곡:"14:08",북삼:"14:14",왜관:"14:23",서대구:"14:40",대구:"14:46",동대구:"14:51",경산:"15:03"}},
      {id:"K1757",times:{구미:"14:52",사곡:"14:57",북삼:"15:03",왜관:"15:12",서대구:"15:33",대구:"15:40",동대구:"15:45",경산:"15:59"}},
      {id:"K1755",times:{구미:null,사곡:null,북삼:null,왜관:null,서대구:null,대구:null,동대구:"15:24",경산:"15:34"}},
      {id:"K1759",times:{구미:"15:20",사곡:"15:25",북삼:"15:31",왜관:"15:45",서대구:"16:01",대구:"16:07",동대구:"16:13",경산:"16:25"}},
      {id:"K1761",times:{구미:"15:45",사곡:"15:50",북삼:"15:56",왜관:"16:05",서대구:"16:22",대구:"16:28",동대구:"16:33",경산:"16:45"}},
      {id:"K1763",times:{구미:"16:05",사곡:"16:10",북삼:"16:16",왜관:"16:25",서대구:"16:42",대구:"16:48",동대구:"16:53",경산:"17:05"}},
      {id:"K1765",times:{구미:"16:27",사곡:"16:32",북삼:"16:38",왜관:"16:47",서대구:"17:04",대구:"17:10",동대구:"17:15",경산:"17:27"}},
      {id:"K1769",times:{구미:"17:00",사곡:"17:05",북삼:"17:11",왜관:"17:20",서대구:"17:37",대구:"17:43",동대구:"17:48",경산:"17:59"}},
      {id:"K1767",times:{구미:null,사곡:null,북삼:null,왜관:null,서대구:null,대구:null,동대구:"17:35",경산:"17:47"}},
      {id:"K1771",times:{구미:"17:31",사곡:"17:36",북삼:"17:42",왜관:"17:51",서대구:"18:08",대구:"18:14",동대구:"18:19",경산:"18:31"}},
      {id:"K1773",times:{구미:"17:54",사곡:"17:59",북삼:"18:05",왜관:"18:19",서대구:"18:35",대구:"18:41",동대구:"18:47",경산:"18:58"}},
      {id:"K1775",times:{구미:"18:16",사곡:"18:21",북삼:"18:27",왜관:"18:36",서대구:"18:53",대구:"18:59",동대구:"19:04",경산:null}},
      {id:"K1777",times:{구미:"18:29",사곡:"18:34",북삼:"18:40",왜관:"18:49",서대구:"19:11",대구:"19:17",동대구:"19:23",경산:"19:35"}},
      {id:"K1779",times:{구미:"18:50",사곡:"18:55",북삼:"19:01",왜관:"19:10",서대구:"19:27",대구:"19:33",동대구:"19:38",경산:"19:50"}},
      {id:"K1781",times:{구미:"19:19",사곡:"19:24",북삼:"19:30",왜관:"19:39",서대구:"19:56",대구:"20:02",동대구:"20:07",경산:"20:19"}},
      {id:"K1783",times:{구미:"19:46",사곡:"19:51",북삼:"19:57",왜관:"20:06",서대구:"20:23",대구:"20:29",동대구:"20:34",경산:"20:46"}},
      {id:"K1785",times:{구미:"20:07",사곡:"20:12",북삼:"20:18",왜관:"20:27",서대구:"20:44",대구:"20:50",동대구:"20:55",경산:"21:07"}},
      {id:"K1787",times:{구미:"20:34",사곡:"20:39",북삼:"20:45",왜관:"20:54",서대구:"21:11",대구:"21:17",동대구:"21:22",경산:"21:34"}},
      {id:"K1789",times:{구미:"20:56",사곡:"21:01",북삼:"21:07",왜관:"21:16",서대구:"21:33",대구:"21:39",동대구:"21:44",경산:"21:56"}},
      {id:"K1791",times:{구미:"21:20",사곡:"21:25",북삼:"21:31",왜관:"21:40",서대구:"21:57",대구:"22:03",동대구:"22:08",경산:"22:24"}},
      {id:"K1793",times:{구미:"21:50",사곡:"21:55",북삼:"22:01",왜관:"22:10",서대구:"22:27",대구:"22:33",동대구:"22:38",경산:"22:50"}},
      {id:"K1795",times:{구미:"22:07",사곡:"22:12",북삼:"22:18",왜관:"22:27",서대구:"22:50",대구:"22:56",동대구:"23:01",경산:"23:13"}},
      {id:"K1797",times:{구미:"22:28",사곡:"22:33",북삼:"22:39",왜관:"22:48",서대구:"23:10",대구:"23:16",동대구:"23:22",경산:"23:34"}},
      {id:"K1799",times:{구미:"22:54",사곡:"22:59",북삼:"23:05",왜관:"23:14",서대구:"23:31",대구:"23:37",동대구:"23:42",경산:null}},
      {id:"K1801",times:{구미:"23:21",사곡:"23:26",북삼:"23:32",왜관:"23:41",서대구:"23:58",대구:"00:04",동대구:"00:09",경산:"00:21"}},
      {id:"K1803",times:{구미:"23:49",사곡:"23:54",북삼:"00:00",왜관:"00:09",서대구:"00:26",대구:"00:32",동대구:"00:37",경산:null}},
    ],
  },
  holiday: {
    up: [
      {id:"K1702",times:{경산:null,동대구:"05:25",대구:"05:30",서대구:"05:36",왜관:"05:52",북삼:"05:58",사곡:"06:02",구미:"06:07"}},
      {id:"K1704",times:{경산:"05:30",동대구:"05:41",대구:"05:47",서대구:"05:53",왜관:"06:09",북삼:"06:15",사곡:"06:19",구미:"06:24"}},
      {id:"K1708",times:{경산:"05:57",동대구:"06:08",대구:"06:14",서대구:"06:20",왜관:"06:36",북삼:"06:42",사곡:"06:46",구미:"06:51"}},
      {id:"K1710",times:{경산:"06:07",동대구:"06:18",대구:"06:24",서대구:"06:30",왜관:"06:46",북삼:"06:52",사곡:"06:56",구미:"07:01"}},
      {id:"K1712",times:{경산:"06:36",동대구:"06:47",대구:"06:53",서대구:"06:59",왜관:"07:15",북삼:"07:21",사곡:"07:25",구미:"07:30"}},
      {id:"K1714",times:{경산:"06:45",동대구:"06:56",대구:"07:02",서대구:"07:08",왜관:"07:24",북삼:"07:30",사곡:"07:34",구미:"07:39"}},
      {id:"K1716",times:{경산:"07:10",동대구:"07:21",대구:"07:27",서대구:"07:33",왜관:"07:49",북삼:"07:55",사곡:"07:59",구미:"08:04"}},
      {id:"K1718",times:{경산:"07:34",동대구:"07:45",대구:"07:51",서대구:"07:57",왜관:"08:13",북삼:"08:19",사곡:"08:23",구미:"08:28"}},
      {id:"K1720",times:{경산:"07:57",동대구:"08:08",대구:"08:13",서대구:"08:19",왜관:"08:36",북삼:"08:42",사곡:"08:45",구미:"08:51"}},
      {id:"K1724",times:{경산:"08:27",동대구:"08:38",대구:"08:44",서대구:"08:50",왜관:"09:06",북삼:"09:12",사곡:"09:16",구미:"09:21"}},
      {id:"K1726",times:{경산:"08:42",동대구:"08:53",대구:"08:59",서대구:"09:05",왜관:"09:21",북삼:"09:27",사곡:"09:31",구미:"09:36"}},
      {id:"K1728",times:{경산:"08:58",동대구:"09:09",대구:"09:15",서대구:"09:21",왜관:"09:37",북삼:"09:43",사곡:"09:47",구미:"09:52"}},
      {id:"K1730",times:{경산:"09:38",동대구:"09:49",대구:"09:55",서대구:"10:01",왜관:"10:17",북삼:"10:23",사곡:"10:27",구미:"10:32"}},
      {id:"K1732",times:{경산:"10:06",동대구:"10:17",대구:"10:23",서대구:"10:29",왜관:"10:45",북삼:"10:51",사곡:"10:55",구미:"11:00"}},
      {id:"K1734",times:{경산:"10:28",동대구:"10:39",대구:"10:45",서대구:"10:51",왜관:"11:07",북삼:"11:13",사곡:"11:17",구미:"11:22"}},
      {id:"K1736",times:{경산:"10:50",동대구:"11:01",대구:"11:07",서대구:"11:13",왜관:"11:29",북삼:"11:35",사곡:"11:39",구미:"11:44"}},
      {id:"K1738",times:{경산:"11:20",동대구:"11:31",대구:"11:37",서대구:"11:43",왜관:"11:59",북삼:"12:05",사곡:"12:09",구미:"12:14"}},
      {id:"K1740",times:{경산:"11:34",동대구:"11:45",대구:"11:51",서대구:"11:57",왜관:"12:13",북삼:"12:24",사곡:"12:27",구미:"12:33"}},
      {id:"K1742",times:{경산:"12:23",동대구:"12:34",대구:"12:40",서대구:"12:46",왜관:"13:02",북삼:"13:08",사곡:"13:12",구미:"13:17"}},
      {id:"K1744",times:{경산:"12:52",동대구:"13:03",대구:"13:09",서대구:"13:15",왜관:"13:31",북삼:"13:37",사곡:"13:41",구미:"13:46"}},
      {id:"K1746",times:{경산:"13:29",동대구:"13:40",대구:"13:46",서대구:"13:52",왜관:"14:08",북삼:"14:14",사곡:"14:18",구미:"14:23"}},
      {id:"K1748",times:{경산:"14:06",동대구:"14:17",대구:"14:24",서대구:"14:30",왜관:"14:46",북삼:"14:52",사곡:"14:56",구미:"15:01"}},
      {id:"K1750",times:{경산:"14:34",동대구:"14:45",대구:"14:51",서대구:"14:57",왜관:"15:13",북삼:"15:19",사곡:"15:23",구미:"15:28"}},
      {id:"K1752",times:{경산:"14:44",동대구:"14:55",대구:"15:01",서대구:"15:07",왜관:"15:23",북삼:"15:35",사곡:"15:39",구미:"15:44"}},
      {id:"K1754",times:{경산:"15:10",동대구:"15:21",대구:"15:27",서대구:"15:33",왜관:"15:49",북삼:"15:55",사곡:"15:59",구미:"16:04"}},
      {id:"K1756",times:{경산:"15:41",동대구:"15:52",대구:"15:58",서대구:"16:04",왜관:"16:20",북삼:"16:26",사곡:"16:30",구미:"16:35"}},
      {id:"K1758",times:{경산:"16:12",동대구:"16:23",대구:"16:29",서대구:"16:35",왜관:"16:51",북삼:"16:57",사곡:"17:01",구미:"17:06"}},
      {id:"K1760",times:{경산:"16:32",동대구:"16:43",대구:"16:49",서대구:"16:55",왜관:"17:11",북삼:"17:17",사곡:"17:21",구미:"17:26"}},
      {id:"K1762",times:{경산:"16:57",동대구:"17:08",대구:"17:14",서대구:"17:20",왜관:"17:36",북삼:"17:42",사곡:"17:46",구미:"17:51"}},
      {id:"K1764",times:{경산:"17:11",동대구:"17:22",대구:"17:30",서대구:"17:36",왜관:"17:52",북삼:"18:03",사곡:"18:06",구미:"18:12"}},
      {id:"K1766",times:{경산:"17:35",동대구:"17:46",대구:"17:52",서대구:"17:58",왜관:"18:14",북삼:"18:20",사곡:"18:24",구미:"18:29"}},
      {id:"K1768",times:{경산:"17:57",동대구:"18:08",대구:"18:14",서대구:"18:20",왜관:"18:36",북삼:"18:47",사곡:"18:50",구미:"18:56"}},
      {id:"K1770",times:{경산:"18:21",동대구:"18:32",대구:"18:38",서대구:"18:44",왜관:"19:00",북삼:"19:06",사곡:"19:10",구미:"19:15"}},
      {id:"K1772",times:{경산:"18:47",동대구:"18:58",대구:"19:04",서대구:"19:10",왜관:"19:26",북삼:"19:32",사곡:"19:36",구미:"19:41"}},
      {id:"K1774",times:{경산:"19:13",동대구:"19:24",대구:"19:30",서대구:"19:36",왜관:"19:52",북삼:"19:58",사곡:"20:02",구미:"20:07"}},
      {id:"K1776",times:{경산:"19:45",동대구:"19:56",대구:"20:02",서대구:"20:08",왜관:"20:24",북삼:"20:30",사곡:"20:34",구미:"20:39"}},
      {id:"K1778",times:{경산:"20:06",동대구:"20:17",대구:"20:22",서대구:"20:28",왜관:"20:45",북삼:"20:51",사곡:"20:54",구미:"21:00"}},
      {id:"K1780",times:{경산:"20:31",동대구:"20:42",대구:"20:48",서대구:"20:54",왜관:"21:10",북삼:"21:16",사곡:"21:20",구미:"21:25"}},
      {id:"K1782",times:{경산:"20:51",동대구:"21:02",대구:"21:08",서대구:"21:14",왜관:"21:30",북삼:"21:36",사곡:"21:40",구미:"21:45"}},
      {id:"K1784",times:{경산:"21:14",동대구:"21:25",대구:"21:31",서대구:"21:37",왜관:"21:53",북삼:"21:59",사곡:"22:03",구미:"22:08"}},
      {id:"K1786",times:{경산:"21:44",동대구:"21:55",대구:"22:01",서대구:"22:07",왜관:"22:23",북삼:"22:29",사곡:"22:33",구미:"22:38"}},
      {id:"K1788",times:{경산:"22:10",동대구:"22:21",대구:"22:27",서대구:"22:33",왜관:"22:49",북삼:"22:55",사곡:"22:59",구미:"23:04"}},
      {id:"K1790",times:{경산:"22:37",동대구:"22:48",대구:"22:54",서대구:"23:00",왜관:"23:16",북삼:"23:22",사곡:"23:26",구미:"23:31"}},
      {id:"K1792",times:{경산:"22:56",동대구:"23:07",대구:"23:12",서대구:"23:18",왜관:"23:35",북삼:"23:41",사곡:"23:44",구미:"23:50"}},
      {id:"K1794",times:{경산:"23:19",동대구:"23:30",대구:"23:36",서대구:"23:42",왜관:"23:58",북삼:"00:04",사곡:"00:08",구미:"00:13"}},
      {id:"K1796",times:{경산:"23:39",동대구:"23:50",대구:"23:55",서대구:"00:01",왜관:"00:18",북삼:"00:24",사곡:"00:27",구미:"00:33"}},
    ],
    down: [
      {id:"K1701",times:{구미:null,사곡:null,북삼:null,왜관:null,서대구:null,대구:null,동대구:"05:35",경산:"05:46"}},
      {id:"K1705",times:{구미:"05:30",사곡:"05:35",북삼:"05:41",왜관:"05:50",서대구:"06:07",대구:"06:13",동대구:"06:18",경산:"06:30"}},
      {id:"K1703",times:{구미:null,사곡:null,북삼:null,왜관:null,서대구:null,대구:null,동대구:"05:49",경산:"06:00"}},
      {id:"K1707",times:{구미:"05:39",사곡:"05:44",북삼:"05:50",왜관:"05:59",서대구:"06:16",대구:"06:22",동대구:"06:27",경산:"06:39"}},
      {id:"K1709",times:{구미:"06:04",사곡:"06:09",북삼:"06:15",왜관:"06:24",서대구:"06:41",대구:"06:47",동대구:"06:52",경산:"07:04"}},
      {id:"K1711",times:{구미:"06:26",사곡:"06:31",북삼:"06:37",왜관:"06:46",서대구:"07:03",대구:"07:09",동대구:"07:14",경산:"07:26"}},
      {id:"K1713",times:{구미:"06:49",사곡:"06:54",북삼:"07:00",왜관:"07:09",서대구:"07:26",대구:"07:32",동대구:"07:37",경산:"07:50"}},
      {id:"K1717",times:{구미:"07:21",사곡:"07:26",북삼:"07:32",왜관:"07:41",서대구:"07:58",대구:"08:04",동대구:"08:09",경산:"08:21"}},
      {id:"K1719",times:{구미:"07:30",사곡:"07:35",북삼:"07:41",왜관:"07:50",서대구:"08:07",대구:"08:13",동대구:"08:18",경산:"08:30"}},
      {id:"K1721",times:{구미:"07:50",사곡:"07:55",북삼:"08:01",왜관:"08:10",서대구:"08:27",대구:"08:33",동대구:"08:38",경산:"08:50"}},
      {id:"K1723",times:{구미:"08:05",사곡:"08:10",북삼:"08:16",왜관:"08:25",서대구:"08:42",대구:"08:48",동대구:"08:53",경산:null}},
      {id:"K1725",times:{구미:"08:20",사곡:"08:25",북삼:"08:31",왜관:"08:40",서대구:"08:57",대구:"09:03",동대구:"09:08",경산:"09:20"}},
      {id:"K1727",times:{구미:"08:44",사곡:"08:49",북삼:"08:55",왜관:"09:04",서대구:"09:21",대구:"09:27",동대구:"09:32",경산:"09:44"}},
      {id:"K1729",times:{구미:"09:08",사곡:"09:13",북삼:"09:23",왜관:"09:33",서대구:"09:49",대구:"09:55",동대구:"10:01",경산:"10:13"}},
      {id:"K1733",times:{구미:"09:40",사곡:"09:45",북삼:"09:51",왜관:"10:00",서대구:"10:17",대구:"10:23",동대구:"10:28",경산:"10:40"}},
      {id:"K1735",times:{구미:"10:00",사곡:"10:05",북삼:"10:15",왜관:"10:25",서대구:"10:41",대구:"10:47",동대구:"10:53",경산:"11:05"}},
      {id:"K1737",times:{구미:"10:25",사곡:"10:30",북삼:"10:36",왜관:"10:45",서대구:"11:02",대구:"11:08",동대구:"11:13",경산:"11:25"}},
      {id:"K1739",times:{구미:"10:56",사곡:"11:01",북삼:"11:07",왜관:"11:16",서대구:"11:33",대구:"11:39",동대구:"11:44",경산:"11:56"}},
      {id:"K1741",times:{구미:"11:15",사곡:"11:20",북삼:"11:26",왜관:"11:35",서대구:"11:52",대구:"11:58",동대구:"12:03",경산:null}},
      {id:"K1743",times:{구미:"11:38",사곡:"11:43",북삼:"11:49",왜관:"11:58",서대구:"12:19",대구:"12:25",동대구:"12:30",경산:"12:42"}},
      {id:"K1745",times:{구미:"11:59",사곡:"12:04",북삼:"12:10",왜관:"12:19",서대구:"12:40",대구:"12:46",동대구:"12:52",경산:"13:04"}},
      {id:"K1747",times:{구미:"13:00",사곡:"13:05",북삼:"13:11",왜관:"13:20",서대구:"13:37",대구:"13:43",동대구:"13:48",경산:"14:00"}},
      {id:"K1749",times:{구미:"13:21",사곡:"13:26",북삼:"13:36",왜관:"13:46",서대구:"14:02",대구:"14:08",동대구:"14:14",경산:"14:25"}},
      {id:"K1751",times:{구미:"13:34",사곡:"13:39",북삼:"13:45",왜관:"13:54",서대구:"14:15",대구:"14:21",동대구:"14:27",경산:"14:39"}},
      {id:"K1753",times:{구미:"14:03",사곡:"14:08",북삼:"14:14",왜관:"14:23",서대구:"14:40",대구:"14:46",동대구:"14:51",경산:"15:03"}},
      {id:"K1757",times:{구미:"14:52",사곡:"14:57",북삼:"15:03",왜관:"15:12",서대구:"15:33",대구:"15:40",동대구:"15:45",경산:"15:59"}},
      {id:"K1755",times:{구미:null,사곡:null,북삼:null,왜관:null,서대구:null,대구:null,동대구:"15:24",경산:"15:34"}},
      {id:"K1759",times:{구미:"15:20",사곡:"15:25",북삼:"15:31",왜관:"15:45",서대구:"16:01",대구:"16:07",동대구:"16:13",경산:"16:25"}},
      {id:"K1761",times:{구미:"15:45",사곡:"15:50",북삼:"15:56",왜관:"16:05",서대구:"16:22",대구:"16:28",동대구:"16:33",경산:"16:45"}},
      {id:"K1763",times:{구미:"16:05",사곡:"16:10",북삼:"16:16",왜관:"16:25",서대구:"16:42",대구:"16:48",동대구:"16:53",경산:"17:05"}},
      {id:"K1765",times:{구미:"16:27",사곡:"16:32",북삼:"16:38",왜관:"16:47",서대구:"17:04",대구:"17:10",동대구:"17:15",경산:"17:27"}},
      {id:"K1769",times:{구미:"17:00",사곡:"17:05",북삼:"17:11",왜관:"17:20",서대구:"17:37",대구:"17:43",동대구:"17:48",경산:"17:59"}},
      {id:"K1767",times:{구미:null,사곡:null,북삼:null,왜관:null,서대구:null,대구:null,동대구:"17:35",경산:"17:47"}},
      {id:"K1771",times:{구미:"17:31",사곡:"17:36",북삼:"17:42",왜관:"17:51",서대구:"18:08",대구:"18:14",동대구:"18:19",경산:"18:31"}},
      {id:"K1773",times:{구미:"17:54",사곡:"17:59",북삼:"18:05",왜관:"18:19",서대구:"18:35",대구:"18:41",동대구:"18:47",경산:"18:58"}},
      {id:"K1775",times:{구미:"18:16",사곡:"18:21",북삼:"18:27",왜관:"18:36",서대구:"18:53",대구:"18:59",동대구:"19:04",경산:null}},
      {id:"K1777",times:{구미:"18:29",사곡:"18:34",북삼:"18:40",왜관:"18:49",서대구:"19:11",대구:"19:17",동대구:"19:23",경산:"19:35"}},
      {id:"K1779",times:{구미:"18:50",사곡:"18:55",북삼:"19:01",왜관:"19:10",서대구:"19:27",대구:"19:33",동대구:"19:38",경산:"19:50"}},
      {id:"K1781",times:{구미:"19:19",사곡:"19:24",북삼:"19:30",왜관:"19:39",서대구:"19:56",대구:"20:02",동대구:"20:07",경산:"20:19"}},
      {id:"K1783",times:{구미:"19:46",사곡:"19:51",북삼:"19:57",왜관:"20:06",서대구:"20:23",대구:"20:29",동대구:"20:34",경산:"20:46"}},
      {id:"K1785",times:{구미:"20:07",사곡:"20:12",북삼:"20:18",왜관:"20:27",서대구:"20:44",대구:"20:50",동대구:"20:55",경산:"21:07"}},
      {id:"K1787",times:{구미:"20:34",사곡:"20:39",북삼:"20:45",왜관:"20:54",서대구:"21:11",대구:"21:17",동대구:"21:22",경산:"21:34"}},
      {id:"K1789",times:{구미:"20:56",사곡:"21:01",북삼:"21:07",왜관:"21:16",서대구:"21:33",대구:"21:39",동대구:"21:44",경산:"21:56"}},
      {id:"K1791",times:{구미:"21:20",사곡:"21:25",북삼:"21:31",왜관:"21:40",서대구:"21:57",대구:"22:03",동대구:"22:08",경산:"22:24"}},
      {id:"K1793",times:{구미:"21:50",사곡:"21:55",북삼:"22:01",왜관:"22:10",서대구:"22:27",대구:"22:33",동대구:"22:38",경산:"22:50"}},
      {id:"K1795",times:{구미:"22:07",사곡:"22:12",북삼:"22:18",왜관:"22:27",서대구:"22:50",대구:"22:56",동대구:"23:01",경산:"23:13"}},
      {id:"K1797",times:{구미:"22:28",사곡:"22:33",북삼:"22:39",왜관:"22:48",서대구:"23:10",대구:"23:16",동대구:"23:22",경산:"23:34"}},
      {id:"K1799",times:{구미:"22:54",사곡:"22:59",북삼:"23:05",왜관:"23:14",서대구:"23:31",대구:"23:37",동대구:"23:42",경산:null}},
      {id:"K1801",times:{구미:"23:21",사곡:"23:26",북삼:"23:32",왜관:"23:41",서대구:"23:58",대구:"00:04",동대구:"00:09",경산:"00:21"}},
      {id:"K1803",times:{구미:"23:49",사곡:"23:54",북삼:"00:00",왜관:"00:09",서대구:"00:26",대구:"00:32",동대구:"00:37",경산:null}},
    ],
  },
};

// 한국 공휴일 (토/일 외 추가)
const HOLIDAYS = new Set([
  "2025-01-01","2025-01-28","2025-01-29","2025-01-30",
  "2025-03-01","2025-05-05","2025-05-06","2025-06-06",
  "2025-08-15","2025-10-03","2025-10-06","2025-10-07","2025-10-08","2025-10-09",
  "2025-12-25",
  "2026-01-01","2026-02-17","2026-02-18","2026-02-19",
  "2026-03-01","2026-05-05","2026-06-06",
  "2026-08-15","2026-09-24","2026-09-25","2026-09-26",
  "2026-10-03","2026-10-09","2026-12-25",
]);
function isHolidayDate(d) {
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return true;
  const y = d.getFullYear(), mo = String(d.getMonth()+1).padStart(2,'0'), da = String(d.getDate()).padStart(2,'0');
  return HOLIDAYS.has(`${y}-${mo}-${da}`);
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════
// 00:xx ~ 03:xx 는 자정 이후(+1440)로 처리
function toMins(hhmm) {
  if (!hhmm) return null;
  const [h,m] = hhmm.split(':').map(Number);
  return h < 4 ? h*60+m+1440 : h*60+m;
}
function nowToMins(h,m) { return h < 4 ? h*60+m+1440 : h*60+m; }
function fmtM(mins) {
  if (mins === null) return '--:--';
  const h = Math.floor(mins/60)%24, m = mins%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

const ALL_STATIONS = ["구미","사곡","북삼","왜관","서대구","대구","동대구","경산"];
// 상행(경산→구미) 순서
const UP_ORDER   = ["경산","동대구","대구","서대구","왜관","북삼","사곡","구미"];
// 하행(구미→경산) 순서
const DOWN_ORDER = ["구미","사곡","북삼","왜관","서대구","대구","동대구","경산"];

const TRANSFERS = {
  서대구:[{name:"KTX",c:"#C0392B"}],
  대구:[{name:"지하철 1호선",c:"#D4700A"}],
  동대구:[{name:"KTX",c:"#C0392B"},{name:"SRT",c:"#6B21A8"},{name:"지하철 1호선",c:"#D4700A"}],
};

function getTT(dir, holiday) { return TIMETABLE[holiday?'holiday':'weekday'][dir]; }

function nextAt(stn, dir, nowM, holiday, cnt=4) {
  return getTT(dir,holiday)
    .map(t=>({...t,stM:toMins(t.times[stn])}))
    .filter(t=>t.stM!==null && t.stM>=nowM)
    .sort((a,b)=>a.stM-b.stM).slice(0,cnt);
}
function firstAt(stn, dir, holiday) {
  const vals = getTT(dir,holiday).map(t=>toMins(t.times[stn])).filter(Boolean).sort((a,b)=>a-b);
  return vals[0] ?? null;
}
function routeSearch(from, to, nowM, holiday) {
  const upF = UP_ORDER.indexOf(from), upT = UP_ORDER.indexOf(to);
  const dir = upF < upT ? 'up' : 'down';
  return getTT(dir,holiday)
    .map(t=>({...t, depM:toMins(t.times[from]), arrM:toMins(t.times[to])}))
    .filter(t=>t.depM!==null && t.arrM!==null && t.depM>=nowM)
    .sort((a,b)=>a.depM-b.depM).slice(0,6);
}
function getPath(from, to) {
  const upF=UP_ORDER.indexOf(from), upT=UP_ORDER.indexOf(to);
  if (upF < upT) return UP_ORDER.slice(upF, upT+1);
  const df=DOWN_ORDER.indexOf(from), dt=DOWN_ORDER.indexOf(to);
  return DOWN_ORDER.slice(df, dt+1);
}

// ═══════════════════════════════════════════════════════════════
//  DESIGN

// ═══════════════════════════════════════════════════════════════
//  DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════
const C={bg:'#07090F',surf:'#0F1520',card:'#121B2B',border:'#192435',
  accent:'#FF7A00',lo:'#FF7A0018',blue:'#3B82F6',green:'#22C55E',
  red:'#EF4444',text:'#DCE8F5',muted:'#526275',tab:'#0A1018'};

const cardS={background:C.card,borderRadius:14,border:`1px solid ${C.border}`,marginBottom:10,overflow:'hidden'};
const selS={background:C.surf,color:C.text,border:`1px solid ${C.border}`,
  borderRadius:9,padding:'9px 12px',fontSize:14,width:'100%',outline:'none',cursor:'pointer',fontFamily:'inherit'};
const scrollS={flex:1,overflowY:'auto',padding:'12px 14px',paddingBottom:80};

function PillBtn({active,onClick,children,col=C.accent}) {
  return <button onClick={onClick} style={{
    background:active?col:C.surf,color:active?'#fff':C.muted,
    border:`1px solid ${active?col:C.border}`,borderRadius:20,
    padding:'5px 14px',fontSize:13,fontWeight:active?700:400,
    cursor:'pointer',transition:'all .15s',fontFamily:'inherit',
  }}>{children}</button>;
}
function SecHead({title,count}) {
  return <div style={{padding:'9px 14px',background:C.surf,borderBottom:`1px solid ${C.border}`,
    display:'flex',justifyContent:'space-between',alignItems:'center'}}>
    <span style={{fontWeight:700,fontSize:14}}>{title}</span>
    {count!==undefined&&<span style={{fontSize:11,color:C.muted}}>총 {count}편</span>}
  </div>;
}
function Badge({stM,nowM}) {
  const d=stM-nowM;
  let txt,col;
  if(d<=0){txt='출발중';col=C.red;}
  else if(d<=2){txt='곧출발';col=C.red;}
  else if(d<=10){txt=`${d}분후`;col=C.green;}
  else{txt=`${d}분후`;col=C.muted;}
  return <span style={{
    background:col+'33',color:col,
    border:`2px solid ${col}`,
    borderRadius:6,padding:'3px 8px',fontSize:12,fontWeight:800,
    animation:d<=2?'pulse 0.8s infinite':'none',
    letterSpacing:-0.3,
  }}>{txt}</span>;
}

// ── 전역출발 팝업 ──
function PrevDepartedPopup({ events, onClose }) {
  if (!events || events.length === 0) return null;
  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'flex-start',paddingTop:72,gap:6,pointerEvents:'none'}}>
      {events.map((ev) => {
        const mins=Math.floor(ev.remSec/60), secs=ev.remSec%60;
        const isUp=ev.dir==='up';
        const accent=isUp?'#FF7A00':'#3B82F6';
        const bg=isUp?'#17100088':'#03091888';
        return (
          <div key={ev.dir} style={{pointerEvents:'auto',background:bg,
            backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',
            border:`1.5px solid ${accent}88`,borderRadius:14,
            padding:'8px 14px 8px 12px',width:'min(360px, 93vw)',
            boxShadow:`0 4px 20px ${accent}33`,
            display:'flex',alignItems:'center',gap:0,
            animation:'slideDown .3s cubic-bezier(.34,1.56,.64,1)'}}>
            <span style={{fontSize:15,marginRight:7,flexShrink:0}}>🚆</span>
            <span style={{fontWeight:800,fontSize:12,color:accent,flexShrink:0,letterSpacing:-0.3,marginRight:6,whiteSpace:'nowrap'}}>{ev.label} 전역 출발</span>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:18,fontWeight:700,letterSpacing:-0.5,color:'#fff',flexShrink:0}}>
              <span style={{background:accent+'28',borderRadius:6,padding:'1px 5px',color:accent}}>{String(mins).padStart(2,'0')}</span>
              <span style={{fontSize:11,color:'#7A8FA8',margin:'0 1px'}}>분</span>
              <span style={{background:accent+'28',borderRadius:6,padding:'1px 5px',color:accent}}>{String(secs).padStart(2,'0')}</span>
              <span style={{fontSize:11,color:'#7A8FA8',marginLeft:1}}>초</span>
            </span>
            <span style={{fontSize:11,color:'#7A8FA8',marginLeft:5,flexShrink:0,whiteSpace:'nowrap'}}>후 도착 예정</span>
            <button onClick={()=>onClose(ev.dir)} style={{background:'none',border:'none',color:'#526275',
              fontSize:14,cursor:'pointer',lineHeight:1,padding:'2px 2px 2px 8px',marginLeft:'auto',flexShrink:0}}>✕</button>
          </div>
        );
      })}
    </div>
  );
}

function getAllAt(stn, dir, hol) {
  return getTT(dir,hol)
    .map(t=>({...t,stM:toMins(t.times[stn])}))
    .filter(t=>t.stM!==null)
    .sort((a,b)=>a.stM-b.stM);
}

// ══════════════════════════════════════════════════════════════
//  탭1: 다음열차
// ══════════════════════════════════════════════════════════════
function NextTab({nowM, nowSec, hol, selectedStn, onStnChange}) {
  const [stn,setStn]=useState(selectedStn||'동대구');
  const closedRef=useRef({});
  const [upOff,setUpOff]=useState(0);
  const [dnOff,setDnOff]=useState(0);

  // 외부 selectedStn 동기화
  useEffect(()=>{
    if(selectedStn&&selectedStn!==stn){
      setStn(selectedStn); closedRef.current={}; setUpOff(0); setDnOff(0);
    }
  },[selectedStn]);

  function changeStn(s){
    setStn(s); onStnChange&&onStnChange(s);
    closedRef.current={}; setUpOff(0); setDnOff(0);
  }

  const xfer=TRANSFERS[stn];
  const upAll=getAllAt(stn,'up',hol);
  const dnAll=getAllAt(stn,'down',hol);
  const upNowIdx=Math.max(0,upAll.findIndex(t=>t.stM>=nowM));
  const dnNowIdx=Math.max(0,dnAll.findIndex(t=>t.stM>=nowM));

  function getSlice(all,nowIdx,off){
    const start=Math.max(0,nowIdx+off);
    return {slice:all.slice(start,start+4)};
  }
  const {slice:upSlice}=getSlice(upAll,upNowIdx,upOff);
  const {slice:dnSlice}=getSlice(dnAll,dnNowIdx,dnOff);

  function calcPrevEvent(slice,dir){
    const t=slice.find(t=>t.stM>=nowM);
    if(!t)return null;
    const order=dir==='up'?UP_ORDER:DOWN_ORDER;
    const stnIdx=order.indexOf(stn);
    const prevIdx=stnIdx-1;
    if(prevIdx<0)return null;
    const prevStn=order[prevIdx];
    const prevTimeStr=t.times[prevStn];
    if(!prevTimeStr)return null;
    const prevM=toMins(prevTimeStr);
    const arrM=toMins(t.times[stn]);
    if(arrM===null)return null;
    if(nowM>=prevM&&nowM<arrM){
      const remSec=arrM*60-nowSec;
      if(remSec<=0)return null;
      const key=dir+'_'+t.id;
      if(closedRef.current[key])return null;
      return {dir,label:dir==='up'?'구미행':'경산행',remSec:Math.max(0,remSec),trainId:t.id};
    }
    return null;
  }

  const [,forceRender]=useState(0);
  useEffect(()=>{forceRender(n=>n+1);},[nowSec]);

  const upEv=calcPrevEvent(upSlice,'up');
  const dnEv=calcPrevEvent(dnSlice,'down');
  const popupEvents=[upEv,dnEv].filter(Boolean);

  function handleClose(dir){
    const slice=dir==='up'?upSlice:dnSlice;
    const t=slice.find(t=>t.stM>=nowM);
    if(t){closedRef.current[dir+'_'+t.id]=true;forceRender(n=>n+1);}
  }

  function NavBar({off,setOff,all,nowIdx}){
    const start=Math.max(0,nowIdx+off);
    const canPrev=start>0, canNext=start+4<all.length;
    const btnBase={flex:1,border:'none',background:'transparent',color:C.muted,
      fontSize:11,fontWeight:600,cursor:'pointer',padding:'7px 10px',
      display:'flex',alignItems:'center',gap:4,fontFamily:'inherit',transition:'color .15s'};
    return (
      <div style={{display:'flex',borderTop:`1px solid ${C.border}`,background:C.surf}}>
        <button disabled={!canPrev} onClick={()=>setOff(o=>o-4)}
          style={{...btnBase,justifyContent:'flex-start',opacity:canPrev?1:0.3}}>
          <span style={{fontSize:14}}>◀</span> 이전 열차 보기
        </button>
        <div style={{width:1,background:C.border,flexShrink:0}}/>
        <button disabled={!canNext} onClick={()=>setOff(o=>o+4)}
          style={{...btnBase,justifyContent:'flex-end',opacity:canNext?1:0.3}}>
          다음 열차 보기 <span style={{fontSize:14}}>▶</span>
        </button>
      </div>
    );
  }

  function TrainList({slice,accentCol,nowFirstId}){
    if(slice.length===0)return(
      <div style={{padding:16,textAlign:'center',color:C.muted,fontSize:13}}>운행 종료</div>
    );
    return slice.map((t)=>{
      const stM=t.stM;
      const isNow=t.id===nowFirstId;
      const loColor=accentCol===C.accent?C.lo:'#3B82F618';
      return <div key={t.id} style={{
        padding:'11px 14px',borderBottom:`1px solid ${C.border}`,
        display:'flex',alignItems:'center',justifyContent:'space-between',
        background:isNow?loColor:'transparent',
        opacity:stM<nowM?0.42:1,
      }}>
        <div style={{display:'flex',alignItems:'baseline',gap:8}}>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:22,fontWeight:700,
            color:isNow?accentCol:stM<nowM?C.muted:C.text,letterSpacing:-0.5}}>{fmtM(stM)}</span>
          <span style={{fontSize:11,color:C.muted}}>{t.id}</span>
        </div>
        {stM>=nowM
          ? <Badge stM={stM} nowM={nowM}/>
          : <span style={{fontSize:11,color:C.muted}}>통과</span>
        }
      </div>;
    });
  }

  const upFirst=firstAt(stn,'up',hol), dnFirst=firstAt(stn,'down',hol);

  return <>
    <PrevDepartedPopup events={popupEvents} onClose={handleClose}/>
    <div style={scrollS}>
      {/* 역명 가운데 큰 글씨 + 깜빡임 */}
      <div style={{marginBottom:8}}>
        <div style={{textAlign:'center',fontSize:22,fontWeight:700,
          color:C.accent,animation:'pulse 1.4s ease-in-out infinite',
          marginBottom:6,fontFamily:"'Space Mono',monospace",letterSpacing:-0.5}}>
          {stn}역
        </div>
        <select style={{...selS,textAlign:'center',fontSize:14}}
          value={stn} onChange={e=>changeStn(e.target.value)}>
          {ALL_STATIONS.map(s=><option key={s} value={s}>{s}역{TRANSFERS[s]?' 🔗':''}</option>)}
        </select>
      </div>
      {xfer&&<div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
        {xfer.map(t=><span key={t.name} style={{background:t.c+'22',color:t.c,
          border:`1px solid ${t.c}44`,borderRadius:4,padding:'2px 7px',fontSize:11,fontWeight:700}}>
          🔗 {t.name} 환승</span>)}
      </div>}

      {/* 구미행 */}
      <div style={cardS}>
        <SecHead title="🚄 구미행 (상행)"/>
        {upAll.length===0
          ? <div style={{padding:16,textAlign:'center',color:C.muted,fontSize:13}}>운행 종료 · 내일 첫차 {fmtM(upFirst)}</div>
          : <>
            <TrainList slice={upSlice} accentCol={C.accent} nowFirstId={upAll[upNowIdx]?.id}/>
            <NavBar off={upOff} setOff={setUpOff} all={upAll} nowIdx={upNowIdx}/>
          </>
        }
      </div>

      {/* BY LEE YANG-HO */}
      <div style={{textAlign:'center',padding:'5px 0',marginBottom:4,
        fontSize:11,fontWeight:700,color:C.blue,letterSpacing:2,opacity:0.75}}>
        BY LEE YANG-HO
      </div>

      {/* 경산행 */}
      <div style={cardS}>
        <SecHead title="🚄 경산행 (하행)"/>
        {dnAll.length===0
          ? <div style={{padding:16,textAlign:'center',color:C.muted,fontSize:13}}>운행 종료 · 내일 첫차 {fmtM(dnFirst)}</div>
          : <>
            <TrainList slice={dnSlice} accentCol={C.blue} nowFirstId={dnAll[dnNowIdx]?.id}/>
            <NavBar off={dnOff} setOff={setDnOff} all={dnAll} nowIdx={dnNowIdx}/>
          </>
        }
      </div>
    </div>
  </>;
}

// ══════════════════════════════════════════════════════════════
//  탭2: 시간표 — 좌/우 분할, 평일·주말 연동, sticky 헤더
// ══════════════════════════════════════════════════════════════
function TTTab({nowM, hol, selectedStn, onStnChange}) {
  const [stn,setStn]=useState(selectedStn||'동대구');
  const [showHol,setShowHol]=useState(hol);
  const upRef=useRef(null);

  // 외부 selectedStn 동기화
  useEffect(()=>{if(selectedStn&&selectedStn!==stn)setStn(selectedStn);},[selectedStn]);
  // hol 변경시 showHol 동기화
  useEffect(()=>{setShowHol(hol);},[hol]);

  function changeStn(s){setStn(s);onStnChange&&onStnChange(s);}

  const upRows=getTT('up',showHol)
    .map(t=>({...t,stM:toMins(t.times[stn])}))
    .filter(t=>t.stM!==null).sort((a,b)=>a.stM-b.stM);
  const dnRows=getTT('down',showHol)
    .map(t=>({...t,stM:toMins(t.times[stn])}))
    .filter(t=>t.stM!==null).sort((a,b)=>a.stM-b.stM);

  const upNi=upRows.findIndex(r=>r.stM>=nowM);
  const dnNi=dnRows.findIndex(r=>r.stM>=nowM);
  const upNext=upNi>=0?upRows[upNi]:null;
  const dnNext=dnNi>=0?dnRows[dnNi]:null;

  useEffect(()=>{
    if(upRef.current)upRef.current.scrollIntoView({block:'center',behavior:'smooth'});
  },[stn,showHol]);

  const holLabel=showHol?'주말·공휴일':'평일';
  const titleLabel=`${stn}역 ${holLabel} 시간표`;

  function ColRows({rows,ni,accentCol,colRef}){
    return rows.map((r,i)=>{
      const past=r.stM<nowM, isNext=i===ni;
      return <div key={r.id} ref={isNext?colRef:null} style={{
        padding:'7px 4px',borderBottom:`1px solid ${C.border}`,
        display:'flex',flexDirection:'column',alignItems:'center',
        opacity:past?0.28:1,
        background:isNext?accentCol+'18':'transparent',
      }}>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:15,fontWeight:700,
          letterSpacing:-0.5,color:isNext?accentCol:past?C.muted:C.text}}>
          {fmtM(r.stM)}
        </span>
        {isNext&&<span style={{fontSize:9,color:accentCol,fontWeight:700,marginTop:1,
          animation:'pulse 1.3s infinite'}}>
          {r.stM-nowM<=0?'출발중':r.stM-nowM<=2?'곧출발':`${r.stM-nowM}분후`}
        </span>}
        {!isNext&&!past&&<span style={{fontSize:9,color:C.muted,marginTop:1}}>{r.stM-nowM}분후</span>}
        {past&&<span style={{fontSize:9,color:C.muted,marginTop:1}}>통과</span>}
      </div>;
    });
  }

  return <div style={{...scrollS,padding:'8px 10px',paddingBottom:80}}>
    {/* 역 선택 */}
    <div style={{marginBottom:6}}>
      <select style={selS} value={stn} onChange={e=>changeStn(e.target.value)}>
        {ALL_STATIONS.map(s=><option key={s} value={s}>{s}역{TRANSFERS[s]?' 🔗':''}</option>)}
      </select>
    </div>

    {/* sticky 헤더: 역명 + sticky 현재열차 */}
    <div style={{
      position:'sticky',top:0,zIndex:10,
      background:C.surf,borderRadius:10,
      border:`1px solid ${C.border}`,
      marginBottom:8,padding:'8px 10px',
    }}>
      {/* 역명 가운데 + 깜빡임 */}
      <div style={{textAlign:'center',fontSize:13,fontWeight:800,
        color:C.text,animation:'pulse 1.5s ease-in-out infinite',marginBottom:6}}>
        {titleLabel}
      </div>
      {/* 구미다음 | 경산다음 */}
      <div style={{display:'flex',justifyContent:'space-around',alignItems:'center'}}>
        <div style={{textAlign:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'center',marginBottom:2}}>
            <span style={{fontSize:16,color:C.accent,fontWeight:900}}>◀</span>
            <span style={{fontSize:12,color:C.accent,fontWeight:700}}>구미 다음</span>
          </div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:18,fontWeight:700,
            color:C.accent}}>{upNext?fmtM(upNext.stM):'--:--'}</div>
        </div>
        <div style={{width:1,height:36,background:C.border}}/>
        <div style={{textAlign:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'center',marginBottom:2}}>
            <span style={{fontSize:12,color:C.blue,fontWeight:700}}>경산 다음</span>
            <span style={{fontSize:16,color:C.blue,fontWeight:900}}>▶</span>
          </div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:18,fontWeight:700,
            color:C.blue}}>{dnNext?fmtM(dnNext.stM):'--:--'}</div>
        </div>
      </div>
    </div>

    {/* 좌우 분할 시간표 */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,
      border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
      <div style={{padding:'7px 4px',background:'#FF7A0018',
        borderBottom:`1px solid ${C.border}`,borderRight:`1px solid ${C.border}`,
        textAlign:'center',fontSize:12,fontWeight:700,color:C.accent}}>
        ← 구미행 ({upRows.length})
      </div>
      <div style={{padding:'7px 4px',background:'#3B82F618',
        borderBottom:`1px solid ${C.border}`,
        textAlign:'center',fontSize:12,fontWeight:700,color:C.blue}}>
        경산행 → ({dnRows.length})
      </div>
      <div style={{borderRight:`1px solid ${C.border}`}}>
        <ColRows rows={upRows} ni={upNi} accentCol={C.accent} colRef={upRef}/>
      </div>
      <div>
        <ColRows rows={dnRows} ni={dnNi} accentCol={C.blue} colRef={null}/>
      </div>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  탭3: 경로검색
// ══════════════════════════════════════════════════════════════
function RouteTab({nowM, hol, selectedStn, onStnChange}) {
  const [from,setFrom]=useState(selectedStn||'경산');
  const [to,setTo]=useState('동대구');
  const [searched,setSearched]=useState(false);

  useEffect(()=>{if(selectedStn)setFrom(selectedStn);},[selectedStn]);
  // hol 변경시 이미 검색한 상태면 자동 재계산 (done 유지)

  function changeFrom(s){setFrom(s);onStnChange&&onStnChange(s);}
  const same=from===to;
  // searched=true이고 same 아니면 hol 변경에도 자동 반영
  const res=searched&&!same?routeSearch(from,to,nowM,hol):[];
  const path=!same?getPath(from,to):[];

  function swap(){setFrom(to);setTo(from);setSearched(false);}

  // 경유 역 2줄 배치 (7개=4+3, 8개=4+4)
  function PathDisplay(){
    if(path.length===0)return null;
    const n=path.length;
    let row1=path, row2=[];
    if(n>=7){row1=path.slice(0,4);row2=path.slice(4);}
    function StationPill({s,i,total}){
      const isEnd=i===0||i===total-1;
      return <span style={{display:'inline-flex',alignItems:'center'}}>
        <span style={{padding:'4px 9px',borderRadius:12,fontSize:12,fontWeight:600,
          background:isEnd?C.accent+'33':C.surf,
          border:`1px solid ${isEnd?C.accent:C.border}`,
          color:isEnd?C.accent:C.text,whiteSpace:'nowrap'}}>{s}</span>
        {i<total-1&&<span style={{color:C.muted,fontSize:10,padding:'0 2px'}}>▶</span>}
      </span>;
    }
    return <div style={{...cardS,padding:'10px 12px'}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:600}}>경유 역</div>
      {/* 1행: 좌측정렬 */}
      <div style={{display:'flex',flexWrap:'nowrap',alignItems:'center',justifyContent:'flex-start',marginBottom:row2.length?4:0}}>
        {row1.map((s,i)=><StationPill key={s} s={s} i={i} total={n}/>)}
      </div>
      {/* 2행: 우측정렬 */}
      {row2.length>0&&<div style={{display:'flex',flexWrap:'nowrap',alignItems:'center',justifyContent:'flex-end'}}>
        {row2.map((s,i)=>{
          const globalI=row1.length+i;
          return <StationPill key={s} s={s} i={globalI} total={n}/>;
        })}
      </div>}
    </div>;
  }

  return <div style={scrollS}>
    <div style={cardS}>
      <div style={{padding:'12px 14px'}}>
        <div style={{display:'flex',gap:8,alignItems:'flex-end',marginBottom:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:14,color:C.text,marginBottom:5,fontWeight:800,textAlign:'center'}}>출발</div>
            <select style={{...selS,textAlign:'center',fontSize:15,fontWeight:700}}
              value={from} onChange={e=>changeFrom(e.target.value)}>
              {ALL_STATIONS.map(s=><option key={s} value={s}>{s}역</option>)}
            </select>
          </div>
          <button onClick={swap} style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:9,
            padding:'9px 11px',cursor:'pointer',color:C.accent,fontSize:18,flexShrink:0,fontFamily:'inherit'}}>⇅</button>
          <div style={{flex:1}}>
            <div style={{fontSize:14,color:C.text,marginBottom:5,fontWeight:800,textAlign:'center'}}>도착</div>
            <select style={{...selS,textAlign:'center',fontSize:15,fontWeight:700}}
              value={to} onChange={e=>{setTo(e.target.value);setSearched(false);}}>
              {ALL_STATIONS.map(s=><option key={s} value={s}>{s}역</option>)}
            </select>
          </div>
        </div>
        <button onClick={()=>setSearched(true)} disabled={same} style={{
          width:'100%',padding:'11px',border:'none',borderRadius:9,fontFamily:'inherit',
          background:same?C.surf:C.accent,color:same?C.muted:'#fff',
          fontSize:14,fontWeight:700,cursor:same?'not-allowed':'pointer',transition:'background .15s',
        }}>🔍 열차 검색</button>
      </div>
    </div>

    {!same&&<PathDisplay/>}

    {searched&&!same&&(
      <div style={cardS}>
        <SecHead title={`${from} → ${to} (${hol?'주말·공휴일':'평일'})`}
          count={res.length}/>
        {res.length===0
          ? <div style={{padding:20,textAlign:'center',color:C.muted,fontSize:13}}>오늘 운행 종료</div>
          : res.map((r,i)=>{
            const travel=r.arrM-r.depM;
            return (
            <div key={r.id} style={{padding:'12px 14px',borderBottom:`1px solid ${C.border}`,
              background:i===0?C.lo:'transparent'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <span style={{fontFamily:"'Space Mono',monospace",fontSize:20,fontWeight:700,
                    color:i===0?C.accent:C.text}}>{fmtM(r.depM)}</span>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
                    <span style={{fontSize:9,color:C.muted}}>소요 {travel}분</span>
                    <span style={{color:C.muted,fontSize:12}}>→</span>
                  </div>
                  <span style={{fontFamily:"'Space Mono',monospace",fontSize:20,fontWeight:700,
                    color:C.text}}>{fmtM(r.arrM)}</span>
                </div>
                {i===0?<Badge stM={r.depM} nowM={nowM}/>
                  :<span style={{fontSize:11,color:C.muted}}>{r.depM-nowM}분 후</span>}
              </div>
              <div style={{fontSize:11,color:C.muted}}>{r.id}</div>
            </div>
          );})
        }
      </div>
    )}
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  탭4: 노선도
// ══════════════════════════════════════════════════════════════
const ROUTE_STNS=[
  {n:"구미",term:true},
  {n:"사곡",term:false},
  {n:"북삼",term:false},
  {n:"왜관",term:false},
  {n:"서대구",xfer:["KTX"],xc:["#C0392B"]},
  {n:"대구",xfer:["지하철 1호선"],xc:["#D4700A"]},
  {n:"동대구",xfer:["KTX","SRT","지하철"],xc:["#C0392B","#6B21A8","#D4700A"]},
  {n:"경산",term:true},
];

const DIST={구미:0,사곡:7,북삼:14,왜관:19,서대구:42,대구:47,동대구:52,경산:64};
const DAEGU=new Set(["서대구","대구","동대구"]);
function calcFare(a,b){
  const km=Math.abs(DIST[a]-DIST[b]);
  let base=1500;
  if(km>10)base+=Math.ceil((km-10)/5)*100;
  base=Math.min(base,2800);
  const cross=DAEGU.has(a)!==DAEGU.has(b);
  return base+(cross?200:0);
}
function fmtFare(n){return n.toLocaleString()+"원";}

function MapTab({selectedStn,nowM,hol,onStnChange}){
  const [selMap,setSelMap]=useState(selectedStn||"동대구");
  useEffect(()=>{if(selectedStn)setSelMap(selectedStn);},[selectedStn]);
  function clickStn(n){setSelMap(n);onStnChange&&onStnChange(n);}

  const fares=ROUTE_STNS.filter(s=>s.n!==selMap).map(s=>({n:s.n,fare:calcFare(selMap,s.n)}));
  const mapUp=nextAt(selMap,'up',nowM,hol,3);
  const mapDn=nextAt(selMap,'down',nowM,hol,3);
  const holLabel=hol?'주말·공휴일':'주중';
  const nextTitle=`${selMap}역 다음 열차 (${holLabel})`;

  return <div style={scrollS}>
    {/* 가로 노선도 */}
    <div style={cardS}>
      <SecHead title="대경선 노선도 (터치하여 역 선택)"/>
      <div style={{padding:"12px 8px 8px",overflowX:"auto"}}>
        <div style={{display:"flex",alignItems:"center",minWidth:360,position:"relative",
          paddingTop:28,paddingBottom:28}}>
          {/* 선로 */}
          <div style={{position:"absolute",top:"50%",left:16,right:16,height:4,
            background:`linear-gradient(to right,${C.accent},${C.blue})`,
            borderRadius:2,transform:"translateY(-50%)",zIndex:0}}/>
          {ROUTE_STNS.map((s,i)=>{
            const isSel=s.n===selMap;
            const hasXfer=!!s.xfer;
            const labelUp=i%2===0;
            const labelSize=11; // 역명 글자 크기 통일
            return (
              <div key={s.n} onClick={()=>clickStn(s.n)}
                style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
                  position:"relative",zIndex:2,cursor:"pointer"}}>
                {/* 위 라벨: 짝수만 */}
                {labelUp
                  ? <div style={{height:24,display:"flex",alignItems:"flex-end",marginBottom:3}}>
                      <span style={{fontSize:labelSize,fontWeight:isSel?800:500,
                        color:isSel?C.accent:hasXfer?"#FBBF24":C.text,
                        textAlign:"center",whiteSpace:"nowrap",
                        animation:isSel?"pulse 1.2s infinite":"none"}}>{s.n}</span>
                    </div>
                  : <div style={{height:27}}/>
                }
                {/* 역 점 */}
                <div style={{
                  width:isSel?20:hasXfer?14:10,
                  height:isSel?20:hasXfer?14:10,
                  borderRadius:"50%",
                  background:isSel?C.accent:hasXfer?"#FBBF24":C.surf,
                  border:`2.5px solid ${isSel?C.accent:hasXfer?"#FBBF24":C.muted}`,
                  boxShadow:isSel?`0 0 14px ${C.accent}AA`:hasXfer?"0 0 7px #FBBF2466":"none",
                  transition:"all .15s",flexShrink:0,
                  animation:isSel?"pulse 1.2s infinite":"none",
                }}/>
                {/* 아래 라벨: 홀수만 */}
                {!labelUp
                  ? <div style={{height:24,display:"flex",alignItems:"flex-start",marginTop:3}}>
                      <span style={{fontSize:labelSize,fontWeight:isSel?800:500,
                        color:isSel?C.accent:hasXfer?"#FBBF24":C.text,
                        textAlign:"center",whiteSpace:"nowrap",
                        animation:isSel?"pulse 1.2s infinite":"none"}}>{s.n}</span>
                    </div>
                  : <div style={{height:27}}/>
                }
              </div>
            );
          })}
        </div>
        {/* ← 구미 / 경산 → 제거됨 */}
      </div>
    </div>

    {/* 다음 열차 */}
    <div style={cardS}>
      {/* 헤더: 구미행 좌측 | 타이틀 중앙 | 경산행 우측 */}
      <div style={{padding:'8px 12px',background:C.surf,borderBottom:`1px solid ${C.border}`,
        display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontWeight:700,fontSize:11,color:C.accent}}>← 구미행</span>
        <span style={{fontWeight:700,fontSize:11,color:C.text,
          animation:'pulse 1.4s infinite'}}>{nextTitle}</span>
        <span style={{fontWeight:700,fontSize:11,color:C.blue}}>경산행 →</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
        {/* 구미행 — 좌측정렬 */}
        <div style={{borderRight:`1px solid ${C.border}`}}>
          {mapUp.length===0
            ? <div style={{padding:'14px 8px',fontSize:11,color:C.muted,textAlign:'left'}}>운행 종료</div>
            : mapUp.map((t,i)=>{
              const stM=toMins(t.times[selMap]);
              const diff=stM-nowM;
              return <div key={t.id} style={{padding:'8px 10px',borderBottom:`1px solid ${C.border}`,
                background:i===0?'#FF7A0008':'transparent',textAlign:'left'}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:16,fontWeight:700,
                  color:i===0?C.accent:C.text,letterSpacing:-0.5}}>{fmtM(stM)}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:1}}>
                  {diff<=0?'출발중':diff<=2?'곧출발':`${diff}분 후`}
                </div>
              </div>;
            })
          }
        </div>
        {/* 경산행 — 우측정렬 */}
        <div>
          {mapDn.length===0
            ? <div style={{padding:'14px 8px',fontSize:11,color:C.muted,textAlign:'right'}}>운행 종료</div>
            : mapDn.map((t,i)=>{
              const stM=toMins(t.times[selMap]);
              const diff=stM-nowM;
              return <div key={t.id} style={{padding:'8px 10px',borderBottom:`1px solid ${C.border}`,
                background:i===0?'#3B82F608':'transparent',textAlign:'right'}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:16,fontWeight:700,
                  color:i===0?C.blue:C.text,letterSpacing:-0.5}}>{fmtM(stM)}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:1}}>
                  {diff<=0?'출발중':diff<=2?'곧출발':`${diff}분 후`}
                </div>
              </div>;
            })
          }
        </div>
      </div>
    </div>

    {/* 요금표 */}
    <div style={cardS}>
      <SecHead title={`${selMap}역 출발 요금 (교통카드)`}/>
      <div style={{padding:"10px 12px 14px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:12}}>
          {fares.map(({n,fare})=>{
            const fareCol=DIST[n]<DIST[selMap]?C.accent:C.blue;
            return(
            <div key={n} style={{background:C.surf,borderRadius:10,padding:"8px 6px",
              border:`1px solid ${C.border}`,display:'flex',flexDirection:'column',gap:3,
              alignItems:'center',textAlign:'center'}}>
              <div style={{fontSize:10,fontWeight:600,color:C.text,opacity:0.7,whiteSpace:'nowrap'}}>{selMap}↔{n}</div>
              <div style={{fontSize:15,fontWeight:800,color:fareCol,letterSpacing:-0.3}}>{fmtFare(fare)}</div>
            </div>);
          })}
        </div>
        <div style={{background:C.surf,borderRadius:9,padding:'9px 12px',
          border:`1px solid ${C.border}`,fontSize:11,color:C.text,lineHeight:1.8,opacity:0.8}}>
          ※ 10km 이내 1,500원 · 5km마다 100원 추가<br/>
          ※ 대구 ↔ 경북 경계 통행 시 +200원<br/>
          ※ 버스·지하철 환승 시 기본요금 50% 할인
        </div>
      </div>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════
function TrainFrontIcon({size=22,active=false}){
  const c=active?'#FF7A00':'#526275';
  return(
    <svg width={size} height={size} viewBox="0 0 36 36" style={{flexShrink:0}}>
      <rect x="4" y="6" width="28" height="20" rx="5" fill={c} opacity="0.15"/>
      <rect x="4" y="6" width="28" height="20" rx="5" stroke={c} strokeWidth="2" fill="none"/>
      <rect x="9" y="9" width="8" height="9" rx="2" fill={c} opacity="0.7"/>
      <rect x="19" y="9" width="8" height="9" rx="2" fill={c} opacity="0.7"/>
      <line x1="18" y1="9" x2="18" y2="18" stroke={c} strokeWidth="1" opacity="0.4"/>
      <rect x="8" y="21" width="20" height="3" rx="1.5" fill={c} opacity="0.5"/>
      <circle cx="12" cy="29" r="3" fill={c} opacity="0.8"/>
      <circle cx="24" cy="29" r="3" fill={c} opacity="0.8"/>
      <line x1="15" y1="29" x2="21" y2="29" stroke={c} strokeWidth="1.5" opacity="0.4"/>
      <line x1="4" y1="5" x2="32" y2="5" stroke={c} strokeWidth="1" opacity="0.35"/>
      <line x1="13" y1="6" x2="11" y2="3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="23" y1="6" x2="25" y2="3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="11" y1="3" x2="25" y2="3" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const TABS=[{icon:null,label:'다음열차',svgIcon:true},{icon:'📋',label:'시간표'},
            {icon:'🔍',label:'경로검색'},{icon:'🗺️',label:'노선도'}];

export default function App(){
  const [tab,setTab]=useState(0);
  const [now,setNow]=useState(()=>new Date());
  const [selectedStn,setSelectedStn]=useState('동대구');
  const [holOverride,setHolOverride]=useState(null);
  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t);},[]);

  const h=now.getHours(), m=now.getMinutes();
  const nowM=nowToMins(h,m);
  const nowSec=nowToMins(h,m)*60+now.getSeconds();
  const holAuto=isHolidayDate(now);
  const hol=holOverride!==null?holOverride:holAuto;
  const ts=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  const ds=now.toLocaleDateString('ko-KR',{month:'short',day:'numeric',weekday:'short'});

  // 헤더 평일/주말 토글 (원형 인디케이터)
  function HolDot({active,label,onClick}){
    return(
      <button onClick={onClick} style={{display:'flex',alignItems:'center',gap:3,
        background:'none',border:'none',cursor:'pointer',padding:'1px 4px',
        borderRadius:10,outline:'none',fontFamily:'inherit'}}>
        <span style={{display:'inline-block',width:9,height:9,borderRadius:'50%',flexShrink:0,
          background:active?'#22C55E':'none',
          border:'1.5px solid #22C55E',
          animation:active?'pulse 1.2s infinite':'none'}}/>
        <span style={{fontSize:9,fontWeight:700,color:active?'#22C55E':C.muted}}>{label}</span>
      </button>
    );
  }

  return <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&family=Space+Mono:wght@700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      body{background:#07090F;}
      select option{background:#0F1520;}
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-track{background:transparent;}
      ::-webkit-scrollbar-thumb{background:#192435;border-radius:3px;}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
      @keyframes slideDown{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:translateY(0)}}
    `}</style>

    <div style={{fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif",
      background:C.bg,color:C.text,height:'100dvh',maxWidth:430,margin:'0 auto',
      display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>

      {/* 헤더 */}
      <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:'10px 16px 9px',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}>
            <svg width="36" height="36" viewBox="0 0 36 36" style={{flexShrink:0}}>
              <rect x="0" y="0" width="36" height="36" rx="9" fill="#FF7A00"/>
              <rect x="7" y="10" width="22" height="16" rx="4" fill="#fff"/>
              <rect x="11" y="12" width="14" height="8" rx="2" fill="#1A3A6E"/>
              <rect x="12" y="13" width="5" height="3" rx="1" fill="#4A8ED4" opacity="0.6"/>
              <rect x="7" y="22" width="22" height="3" fill="#1A3A6E"/>
              <circle cx="11" cy="27" r="2.5" fill="#FFE066"/>
              <circle cx="11" cy="27" r="1.5" fill="#fff"/>
              <circle cx="25" cy="27" r="2.5" fill="#FFE066"/>
              <circle cx="25" cy="27" r="1.5" fill="#fff"/>
              <rect x="14" y="24" width="8" height="3" rx="1" fill="#0A1830"/>
              <line x1="15" y1="10" x2="13" y2="6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="21" y1="10" x2="23" y2="6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="13" y1="6" x2="23" y2="6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="4" y1="5" x2="32" y2="5" stroke="#ffffff88" strokeWidth="0.8"/>
            </svg>
            <div>
              <div style={{fontWeight:800,fontSize:15,letterSpacing:-0.3}}>대경선 시간표</div>
              <div style={{display:'flex',alignItems:'center',gap:4,marginTop:1}}>
                <span style={{fontSize:9,color:C.muted}}>구미↔경산</span>
                <HolDot active={!hol} label="평일" onClick={()=>setHolOverride(false)}/>
                <HolDot active={hol} label="주말·공휴일" onClick={()=>setHolOverride(true)}/>
              </div>
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:20,fontWeight:700,color:C.accent}}>{ts}</div>
            <div style={{fontSize:10,color:C.muted}}>{ds}</div>
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {tab===0&&<NextTab nowM={nowM} nowSec={nowSec} hol={hol} selectedStn={selectedStn} onStnChange={setSelectedStn}/>}
        {tab===1&&<TTTab nowM={nowM} hol={hol} selectedStn={selectedStn} onStnChange={setSelectedStn}/>}
        {tab===2&&<RouteTab nowM={nowM} hol={hol} selectedStn={selectedStn} onStnChange={setSelectedStn}/>}
        {tab===3&&<MapTab selectedStn={selectedStn} nowM={nowM} hol={hol} onStnChange={setSelectedStn}/>}
      </div>

      {/* 탭바 */}
      <div style={{background:C.tab,borderTop:`1px solid ${C.border}`,display:'flex',height:60,flexShrink:0}}>
        {TABS.map(({icon,label,svgIcon},i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{
            flex:1,border:'none',background:'transparent',fontFamily:'inherit',
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,
            cursor:'pointer',color:tab===i?C.accent:C.muted,fontSize:10,fontWeight:tab===i?700:400,transition:'color .15s',
          }}>
            {svgIcon
              ? <TrainFrontIcon size={tab===i?22:19} active={tab===i}/>
              : <span style={{fontSize:tab===i?20:18,transition:'font-size .15s'}}>{icon}</span>
            }
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  </>;
}
