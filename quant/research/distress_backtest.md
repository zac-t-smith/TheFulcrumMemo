# Fulcrum v5 Phase 4 — Distress Radar backtest (v2)

_Generated 2026-11-14T05:03:03.609938+00:00. Panel: 53,822 rows at load (after in-case drop: 52,572 rows; 1,250 rows dropped). Bankruptcy filings loaded: 1,316; distinct CIKs: 691; follow-up filings dropped: 603; Chapter 22 refilings: 22; **final cases: 713**._

## Label-set scope

SEC 8-K Item 1.03 covers "Bankruptcy or Receivership" — not Chapter 11 specifically. This label set therefore represents **bankruptcy filings** (Chapter 11 + Chapter 7 + receiverships, and occasionally Chapter 15 or non-US proceedings disclosed on US-listed entities). Classification by chapter would require pulling each 8-K body and scanning for the chapter keyword; left as a follow-up. Treating all as "bankruptcy filing" is conservative — if a sizeable fraction is Chapter 7 / liquidation, the scores' lead time understates what's achievable for Chapter 11 reorg candidates (which the Distress Radar is built to catch).

Median gap between a follow-up filing and its parent case: **3.6 months**. That lines up with the plan-confirmation / emergence rhythm (not new petitions).

## Coverage by company (not by filing)

Of the **691 distinct bankrupt companies**, **197 (28.5%)** appear in the panel at least once in the 24 months before their first petition.

### Subset: last pre-petition XBRL Liabilities ≥ $250m
**190 / 305 (62.3%)** of these companies are in the panel in the 24 months before petition. The misses below are the ones whose economic size says they belonged in the universe but weren't captured.

| Petition | Name | CIK | Liabilities (last) | SIC | Reason |
|---|---|---|---:|---:|---|
| 2015-01-09 | UniTek Global Services, Inc.  (CIK 0000826773) | 0000826773 | $257M | 4812 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2015-01-15 | CAESARS ENTERTAINMENT OPERATING COMPANY, INC.  (CIK 0000858395) | 0000858395 | $19.9B | 7011 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2015-03-02 | DORAL FINANCIAL CORP  (CIK 0000840889) | 0000840889 | $7.8B | 6029 | excluded SIC 6029 |
| 2015-03-10 | BPZ RESOURCES, INC.  (CIK 0001023734) | 0001023734 | $364M | 1311 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2015-03-13 | STANDARD REGISTER CO  (CIK 0000093456) | 0000093456 | $464M | 2761 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2015-05-06 | CORINTHIAN COLLEGES INC  (CIK 0001066134) | 0001066134 | $425M | 8200 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2015-05-21 | RENAISSANCERE HOLDINGS LTD  (RNR, RNR-PF, RNR-PG)  (CIK 0000913144) | 0000913144 | $5.5B | 6331 | excluded SIC 6331 |
| 2015-06-03 | DENDREON CORP  (CIK 0001107332) | 0001107332 | $340M | 2834 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2015-06-30 | Molycorp, Inc.  (CIK 0001489137) | 0001489137 | $1.8B | 1000 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2015-09-17 | AFFIRMATIVE INSURANCE HOLDINGS INC  (CIK 0001282543) | 0001282543 | $448M | 6331 | excluded SIC 6331 |
| 2015-10-06 | MILLER ENERGY RESOURCES, INC.  (CIK 0000785968) | 0000785968 | $337M | 1311 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2015-10-08 | AMERICAN APPAREL, INC  (CIK 0001336545) | 0001336545 | $411M | 6770 | excluded SIC 6770 |
| 2015-12-11 | Energy Future Holdings Corp /TX/  (CIK 0001023291) | 0001023291 | $47.5B | 4911 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2016-02-04 | RCS Capital Corp  (CIK 0001568832) | 0001568832 | $1.4B | 6211 | excluded SIC 6211 |
| 2016-03-23 | Emerald Oil, Inc.  (CIK 0001283843) | 0001283843 | $361M | 1311 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2016-04-08 | PACIFIC SUNWEAR OF CALIFORNIA INC  (CIK 0000874841) | 0000874841 | $299M | 5600 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2016-04-13 | PEABODY ENERGY CORP  (BTU)  (CIK 0001064728) | 0001064728 | $10.1B | 1221 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2016-04-14 | SIGA TECHNOLOGIES INC  (SIGA)  (CIK 0001010086) | 0001010086 | $470M | 2834 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2016-05-06 | AEROPOSTALE INC  (CIK 0001168213) | 0001168213 | $434M | 5600 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2016-07-21 | C&J Energy Services Ltd.  (CIK 0001615817) | 0001615817 | $1.6B | 1389 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2016-09-26 | ITT EDUCATIONAL SERVICES INC  (CIK 0000922475) | 0000922475 | $420M | 8200 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2016-10-31 | Performance Sports Group Ltd.  (CIK 0001514242) | 0001514242 | $587M | 3949 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2017-03-07 | hhgregg, Inc.  (CIK 0001396279) | 0001396279 | $300M | 5731 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2017-03-13 | Gordmans Stores, Inc.  (CIK 0001490636) | 0001490636 | $275M | 5600 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2017-04-20 | Adeptus Health Inc.  (CIK 0001602367) | 0001602367 | $453M | 8060 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2017-05-01 | Nuverra Environmental Solutions, Inc.  (CIK 0001403853) | 0001403853 | $512M | 1389 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2017-05-04 | First NBC Bank Holding Co  (CIK 0001496631) | 0001496631 | $4.4B | 6022 | excluded SIC 6022 |
| 2017-06-14 | NRG ENERGY, INC.  (NRG)  (CIK 0001013871) | 0001013871 | $25.4B | 4911 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2017-06-19 | CASTLE A M & CO  (CIK 0000018172) | 0000018172 | $339M | 5051 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2017-08-29 | Perfumania Holdings, Inc.  (CIK 0000880460) | 0000880460 | $254M | 5900 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2017-12-01 | WALTER INVESTMENT MANAGEMENT CORP  (CIK 0001040719) | 0001040719 | $15.2B | 6162 | excluded SIC 6162 |
| 2017-12-12 | J.G. Wentworth Co  (CIK 0001580185) | 0001580185 | $5.2B | 6199 | excluded SIC 6199 |
| 2018-01-30 | Rand Logistics, Inc.  (CIK 0001294250) | 0001294250 | $260M | 4400 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2018-04-02 | FirstEnergy Solutions Corp.  (CIK 0001407703) | 0001407703 | $48.7B | 4911 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2018-04-26 | Erin Energy Corp.  (CIK 0001402281) | 0001402281 | $614M | 1381 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2018-05-18 | REX ENERGY CORP  (CIK 0001397516) | 0001397516 | $1.1B | 1311 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2018-12-14 | EMERGENT CAPITAL, INC.  (CIK 0001494448) | 0001494448 | $477M | 6311 | excluded SIC 6311 |
| 2019-05-10 | CLOUD PEAK ENERGY INC.  (CIK 0001441849) | 0001441849 | $639M | 1221 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2019-05-21 | NOVELION THERAPEUTICS INC.  (CIK 0000827809) | 0000827809 | $461M | 2834 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2019-06-10 | Insys Therapeutics, Inc.  (CIK 0001516479) | 0001516479 | $336M | 2834 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2019-07-02 | Weatherford International plc  (WFRD)  (CIK 0001603923) | 0001603923 | $10.6B | 3533 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2019-07-17 | Emerge Energy Services LP  (CIK 0001555177) | 0001555177 | $266M | 1400 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2019-07-25 | LendingTree, Inc.  (TREE)  (CIK 0001434621) | 0001434621 | $640M | 6163 | excluded SIC 6163 |
| 2019-08-05 | iPic Entertainment Inc.  (CIK 0001720201) | 0001720201 | $291M | 5810 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2019-09-03 | RAIT Financial Trust  (CIK 0001045425) | 0001045425 | $665M | 6798 | excluded SIC 6798 |
| 2019-09-09 | FREDS INC  (CIK 0000724571) | 0000724571 | $380M | 5331 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2019-09-12 | Alta Mesa Resources, Inc. /DE  (CIK 0001690769) | 0001690769 | $1.1B | 1311 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2019-11-04 | Foresight Energy LP  (CIK 0001540729) | 0001540729 | $1.8B | 1220 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2019-12-19 | CELADON GROUP INC  (CIK 0000865941) | 0000865941 | $381M | 4213 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2019-12-27 | MELINTA THERAPEUTICS, INC. /NEW/  (CIK 0001461993) | 0001461993 | $289M | 2834 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2020-03-30 | CARBO CERAMICS INC  (CIK 0001009672) | 0001009672 | $439M | 3290 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2020-05-26 | UNIT CORP  (UNTC, UNTCW)  (CIK 0000798949) | 0000798949 | $2.1B | 1311 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2020-05-26 | HERTZ GLOBAL HOLDINGS, INC  (HTZ, HTZWW)  (CIK 0001657853) | 0001657853 | $24.4B | 7510 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2020-05-28 | TUESDAY MORNING CORP/DE  (TUEMQ)  (CIK 0000878726) | 0000878726 | $508M | 5331 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2020-06-24 | GNC HOLDINGS, INC.  (CIK 0001502034) | 0001502034 | $1.6B | 5400 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2020-06-24 | Jason Industries, Inc.  (CIK 0001579252) | 0001579252 | $495M | 3990 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2020-06-29 | LILIS ENERGY, INC.  (CIK 0001437557) | 0001437557 | $251M | 1311 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2020-07-13 | RTW Retailwinds, Inc.  (CIK 0001211351) | 0001211351 | $396M | 5621 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2020-07-22 | Global Eagle Entertainment Inc.  (CIK 0001512077) | 0001512077 | $1.1B | 4899 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2020-09-14 | TOWN SPORTS INTERNATIONAL HOLDINGS INC  (CIK 0001281774) | 0001281774 | $890M | 7997 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2020-11-03 | PENNSYLVANIA REAL ESTATE INVESTMENT TRUST  (CIK 0000077281) | 0000077281 | $2.0B | 6798 | excluded SIC 6798 |
| 2020-12-04 | Francesca's Holdings CORP  (CIK 0001399935) | 0001399935 | $294M | 5600 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2021-05-19 | Hospitality Investors Trust, Inc.  (CIK 0001583077) | 0001583077 | $1.4B | 6798 | excluded SIC 6798 |
| 2021-06-14 | WASHINGTON PRIME GROUP INC.  (CIK 0001594686) | 0001594686 | $3.5B | 6798 | excluded SIC 6798 |
| 2021-08-12 | CBL & ASSOCIATES PROPERTIES INC  (CBL)  (CIK 0000910612) | 0000910612 | $4.0B | 6798 | excluded SIC 6798 |
| 2022-04-13 | ION GEOPHYSICAL CORP  (CIK 0000866609) | 0000866609 | $256M | 1382 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2022-04-20 | GWG Holdings, Inc.  (CIK 0001522690) | 0001522690 | $2.1B | 6311 | excluded SIC 6311 |
| 2022-05-12 | Armstrong Flooring, Inc.  (AFIIQ)  (CIK 0001655075) | 0001655075 | $318M | 3089 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2022-12-12 | FedNat Holding Co  (CIK 0001069996) | 0001069996 | $1.2B | 6331 | excluded SIC 6331 |
| 2022-12-21 | Core Scientific, Inc./tx  (CORZ, CORZR, CORZW, CORZZ)  (CIK 0001839341) | 0001839341 | $1.3B | 6199 | excluded SIC 6199 |
| 2023-01-10 | Quotient Ltd  (CIK 0001596946) | 0001596946 | $310M | 2835 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2023-02-13 | Sorrento Therapeutics, Inc.  (SRNE)  (CIK 0000850261) | 0000850261 | $485M | 2836 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2023-02-21 | Starry Group Holdings, Inc.  (CIK 0001884697) | 0001884697 | $310M | 4813 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2023-03-10 | SVB FINANCIAL GROUP  (SIVBQ)  (CIK 0000719739) | 0000719739 | $195.5B | 6022 | excluded SIC 6022 |
| 2023-04-12 | National CineMedia, Inc.  (NCMI)  (CIK 0001377630) | 0001377630 | $1.2B | 7310 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2023-05-31 | QualTek Services Inc.  (CIK 0001839412) | 0001839412 | $790M | 1623 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2023-06-01 | DIEBOLD NIXDORF, Inc  (DBD)  (CIK 0000028823) | 0000028823 | $3.1B | 3578 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2023-06-29 | iMedia Brands, Inc.  (CIK 0000870826) | 0000870826 | $424M | 5961 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2023-07-11 | ALPINE SUMMIT ENERGY PARTNERS, INC.  (CIK 0001882607) | 0001882607 | $253M | 1311 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2023-07-24 | AppHarvest, Inc.  (CIK 0001807707) | 0001807707 | $341M | 100 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2023-08-03 | Ault Alliance, Inc.  (AULT, AULT-PD)  (CIK 0000896493) | 0000896493 | $337M | 3533 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2023-08-08 | Proterra Inc  (CIK 0001820630) | 0001820630 | $560M | 3711 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2023-08-24 | Orbital Infrastructure Group, Inc.  (CIK 0001108967) | 0001108967 | $428M | 5065 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2023-09-14 | SILVER STAR PROPERTIES REIT, INC  (CIK 0001446687) | 0001446687 | $325M | 6500 | excluded SIC 6500 |
| 2023-10-02 | SmileDirectClub, Inc.  (SDCCQ)  (CIK 0001775625) | 0001775625 | $989M | 3843 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2023-11-07 | WeWork Inc.  (CIK 0001813756) | 0001813756 | $18.7B | 6512 | excluded SIC 6512 |
| 2024-02-05 | NanoString Technologies Inc  (CIK 0001401708) | 0001401708 | $325M | 2836 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2024-02-14 | Invitae Corp  (CIK 0001501134) | 0001501134 | $1.6B | 8071 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2024-02-26 | CorEnergy Infrastructure Trust, Inc.  (CIK 0001347652) | 0001347652 | $254M | 6798 | excluded SIC 6798 |
| 2024-03-13 | Enviva Inc.  (EVA)  (CIK 0001592057) | 0001592057 | $2.6B | 2400 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2024-03-25 | CURO Group Holdings Corp.  (CIK 0001711291) | 0001711291 | $2.2B | 6199 | excluded SIC 6199 |
| 2024-04-03 | View, Inc.  (CIK 0001811856) | 0001811856 | $359M | 3211 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2024-04-29 | REPUBLIC FIRST BANCORP INC  (FRBK, FRBKQ)  (CIK 0000834285) | 0000834285 | $5.8B | 6022 | excluded SIC 6022 |
| 2024-06-03 | CalAmp Corp.  (CIK 0000730255) | 0000730255 | $355M | 3663 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2024-06-24 | Fisker Inc./DE  (FSRNQ)  (CIK 0001720990) | 0001720990 | $1.9B | 3711 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2024-07-01 | DELTA APPAREL, INC  (DLAPQ)  (CIK 0001101396) | 0001101396 | $260M | 5130 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2024-07-24 | Vintage Wine Estates, Inc.  (VWESQ, VWEWQ)  (CIK 0001834045) | 0001834045 | $393M | 2080 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2024-08-12 | LL Flooring Holdings, Inc.  (LLFLQ)  (CIK 0001396033) | 0001396033 | $394M | 5211 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2024-09-09 | Edgio, Inc.  (EGIO)  (CIK 0001391127) | 0001391127 | $300M | 7389 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2024-09-26 | Vertex Energy Inc.  (VTNR)  (CIK 0000890447) | 0000890447 | $643M | 2911 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2024-10-07 | Gold Flora Corp.  (GRAM, GRAMW)  (CIK 0001876945) | 0001876945 | $253M | 100 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2024-11-18 | CareMax, Inc.  (CMAX, CMAXW)  (CIK 0001813914) | 0001813914 | $602M | 8050 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2025-01-15 | Mondee Holdings, Inc.  (MOND)  (CIK 0001828852) | 0001828852 | $359M | 4700 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2025-01-21 | Canoo Inc.  (GOEV, GOEVW)  (CIK 0001750153) | 0001750153 | $301M | 3714 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2025-02-19 | Nikola Corp  (NKLA)  (CIK 0001731289) | 0001731289 | $657M | 3711 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2025-03-05 | CUTERA INC  (CUTR)  (CIK 0001162461) | 0001162461 | $487M | 3845 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2025-03-18 | Danimer Scientific, Inc.  (DNMR, DNMRW)  (CIK 0001779020) | 0001779020 | $432M | 2821 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2025-06-10 | 4Front Ventures Corp.  (FFNTF)  (CIK 0001783875) | 0001783875 | $327M | 2833 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2025-07-01 | WOLFSPEED, INC.  (WOLF)  (CIK 0000895419) | 0000895419 | $7.6B | 3674 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2025-09-18 | LUXURBAN HOTELS INC.  (CIK 0001893311) | 0001893311 | $283M | 6500 | excluded SIC 6500 |
| 2025-10-31 | OFFICE PROPERTIES INCOME TRUST  (OPI, OPINL)  (CIK 0001456772) | 0001456772 | $2.5B | 6500 | excluded SIC 6500 |
| 2025-11-14 | Sonder Holdings Inc.  (SOND, SONDW)  (CIK 0001819395) | 0001819395 | $1.5B | 7000 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2025-12-15 | IROBOT CORP  (IRBT)  (CIK 0001159167) | 0001159167 | $508M | 3630 | debt < $250m (non-debt liabilities dominant) or missing debt tag |
| 2026-06-08 | GoHealth, Inc.  (GOCO)  (CIK 0001808220) | 0001808220 | $918M | 6411 | excluded SIC 6411 |
| 2026-11-03 | Karyopharm Therapeutics Inc.  (KPTI)  (CIK 0001503802) | 0001503802 | $441M | 2834 | debt < $250m (non-debt liabilities dominant) or missing debt tag |

## Score metrics — full sample

Each row is scored on whatever subset the panel has for that key.

| Score | n rows | base 12m | base 6m | AUC 12m | AUC 6m | Top-10% prec 12m | Lift 12m | Top-10% prec 6m | Lift 6m | Co. flagged | Median lead (mo) | ≥6m ahead |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Altman Z'' | 31,864 | 1.38% | 0.74% | 0.733 | 0.763 | 3.63% | 2.62× | 2.49% | 3.35× | 52 | 5.3 | 44.23% |
| Coverage (EBIT / Interest) | 43,107 | 1.37% | 0.73% | 0.717 | 0.736 | 3.62% | 2.64× | 2.17% | 2.97× | 63 | 10.6 | 73.02% |
| Net leverage (NetDebt / EBITDA) | 43,096 | 0.86% | 0.43% | 0.620 | 0.643 | 1.42% | 1.66× | 0.82% | 1.91× | 44 | 14.4 | 75.00% |
| Liquidity runway (months) | 17,460 | 2.17% | 1.14% | 0.521 | 0.533 | 2.55% | 1.18× | 1.16% | 1.02× | 20 | 13.8 | 80.00% |
| 24m maturity pressure | 40,519 | 1.26% | 0.66% | 0.545 | 0.555 | 1.91% | 1.52× | 1.04% | 1.57× | 34 | 11.9 | 67.65% |

## Score metrics — common subset (4,416 rows where all five scores exist)

Apples-to-apples: each score is evaluated on the same rows so AUC and lift comparisons are not biased by which rows were available.

| Score | n rows | base 12m | base 6m | AUC 12m | AUC 6m | Top-10% prec 12m | Lift 12m | Top-10% prec 6m | Lift 6m | Co. flagged | Median lead (mo) | ≥6m ahead |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Altman Z'' | 4,416 | 1.38% | 0.66% | 0.586 | 0.609 | 2.13% | 1.54× | 1.18% | 1.80× | 5 | 12.0 | 80.00% |
| Coverage (EBIT / Interest) | 4,416 | 1.38% | 0.66% | 0.650 | 0.666 | 2.13% | 1.54× | 1.18% | 1.80× | 7 | 19.0 | 71.43% |
| Net leverage (NetDebt / EBITDA) | 4,416 | 1.38% | 0.66% | 0.638 | 0.645 | 1.18% | 0.86× | 0.95% | 1.44× | 6 | 11.0 | 50.00% |
| Liquidity runway (months) | 4,416 | 1.38% | 0.66% | 0.470 | 0.475 | 1.65% | 1.20× | 0.47% | 0.72× | 4 | 15.9 | 100.00% |
| 24m maturity pressure | 4,416 | 1.38% | 0.66% | 0.409 | 0.406 | 0.95% | 0.68× | 0.47% | 0.72× | 2 | 14.8 | 100.00% |

### Read conventions

- Sign on net leverage and maturity-pressure is flipped so "top decile" always means riskiest.
- `Base 12m` and `Base 6m` are the share of panel rows for that score whose CIK files a bankruptcy within the forward window.
- `Lift` = top-decile precision ÷ base rate. 1.0× is random; >3× is an informative signal given the small base rate.
- `Co. flagged` counts distinct CIKs the score entered the top decile at any quarter-end in the 24 months before their case start.
- `Median lead` is median months from the first in-top-decile quarter-end to the petition date, per bankrupt company (not per row).
- `≥6m ahead` is the share of flagged companies first flagged at least six months before the petition.

### Caveats

- Flow quantities (OperatingIncomeLoss, InterestExpense, D&A, CFO, capex) use the most recent FY (10-K) observation — LTM stale up to ~12 months. Quarterly LTM aggregation is a follow-up and should re-lift runway and maturity-pressure.
- Liquidity runway in the current pass shows essentially no skill (lift close to 1×). Keep it in the table for transparency, but tier rules that use it should wait on quarterly LTM.
- Merton distance-to-default and CHS failure probability aren't scored here (Yahoo lacks delisted-ticker prices). Live-only add-ons.
- Universe excludes the market-cap-below-debt branch for the backtest (no price panel). That branch stays live in the production radar.
