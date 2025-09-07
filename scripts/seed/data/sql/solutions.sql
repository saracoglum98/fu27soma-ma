-- Sample knowledge items for demonstration
INSERT INTO solutions (uuid, solution_space, name, req_customer, req_business) VALUES
    ('caabad12-cf62-4944-9765-4df37769a729', '22f7c9af-2a4b-4e5a-a695-a82530182405', 'Warehouse for Customer A', 
    '
    Fragenkatalog logistische Basisdaten Kunde A

**Inhalt**

[1 Wareneingang 1](#_Toc33788917)

[2 Lagerspiegel Fertigwaren 2](#_Toc33788918)

[3 Kommissionierung 2](#_Toc33788919)

[4 Versand 3](#_Toc33788920)

[5 Allgemein 3](#_Toc33788921)

|  |  |
| --- | --- |
| Wareneingang (hat in diesem Projekt keine rolle gespielt) |  |
| 1. Anzahl Lieferungen pro Tag/ Monat/ Jahr | / |
| 1. Erfolgt die Anlieferung immer palettiert bzw. als Container? Ggfs. in welcher Form? | / |
| 1. Abmessungen und Anteile der Ladungsträger (z.B. % Europalette 1.200 x 800,  % Industriepalette 1.200 x 1.000, Container, Kartontypen etc.) | / |
| 1. Anzahl Ladungsträger pro Tag/ Monat/ Jahr (Durchschnitt, Spitzen) | / |
| 1. Werden die Lieferungen avisiert? | / |
| 1. Gibt es Chargen? | / |
| 1. Qualitätsprüfung: welche Anforderungen gibt es? | / |
| 1. Gibt es Cross-Docking o.ä.? | / |
| 1. Ggf. weitere Anforderungen in Bezug auf Vereinnahmung/ Lagerung/ …? | / |

|  |  |
| --- | --- |
| Lagerspiegel  Fertigwaren |  |
| 1. Anzahl Artikel | 14.000 (aber davon sind nicht alle im Kleinteilelager) |
| 1. Abmessungen (L x B x H, von-bis) | Passen alle in einen Behälter 600x400x220 mm |
| 1. Gewichte Ladungsträger kplt. | Max. 50 kg |
| 1. Lagerkapazität (Stellplätze Ladungsträger), Mindestanforderung | 7.500 Behälterstellplätze |
| 1. Menge je Palette (Anzahl Fässer, Gebinde) | / |
| 1. Ladungssicherung | / |
| 1. Ggf. Artikelklassifizierung (ABC) | / |

|  |  |
| --- | --- |
| Kommissionierung |  |
| 1. Anzahl Aufträge/ Lieferscheine pro Tag/ Monat/ Jahr (Durchschnitt, Spitzenwerte) | 70 Doppelspiele pro Stunde |
| 1. ∅ Anzahl Auftragspositionen | / |
| 1. Saisonale Effekte? | / |
| 1. Tagesspitzen? | 200 Doppelspiele pro Stunde |
| 1. Anzahl Anbruchpaletten | / |
| 1. Ggf. Analyse einer Auftragsliste eines aussagekräftigen Betrachtungszeitraumes mit Zeitstempel, Produkt-ID und Auftragszuordnung möglich? | / |
| 1. Durchschnittliche Bearbeitungszeit je Auftrag/Ladungsträger? | 60 Sekunden pro Ladungsträger im Durchschnitt |
| 1. Anzahl Kommissionierplätze | Ist zu definieren 🡪 Lösung sollte LLM herausfinden |

|  |  |
| --- | --- |
| Versand |  |
| 1. Anzahl Versandpaletten pro Tag/ Monat/ Jahr (Durchschnitt, Spitzenwerte) | / |
| 1. Ø Sendungsgröße: Anz. Paletten, Gewicht, Volumen | / |
| 1. Saisonale Effekte? | / |
| 1. Tagesspitzen (Abholfenster) ? | / |

|  |  |
| --- | --- |
| Allgemein |  |
| 1. Lagerstandorte und Funktion (Produktionslager, Versandlager etc.) | Produktionsversorgung mit Kleinteilen |
| 1. Angaben zum Baufenster (L x B x H) | 52000 x 7000 x 10000 mm |
| 1. Ist-Personalbestand (WE, Komm., Versand, …) | / |
| 1. Arbeitszeiten / Schichtmodell (Produktion, innerwerklicher Transport, Versand) | 2-schichtig (16 h/Tag) |
| 1. Materialflussdiagramm SOLL bzw.  –beschreibung | Wird in diesem Fall nicht mehr gebraucht, steht im Fragenkatalog |
| 1. Wachstumserwartung - Sortiment - Durchsatz - Bestand, jew. geplante Entwicklung pro Jahr (für 5 – 10 Jahre) | Ist bereits in den Zahlen enthalten |
| 1. Prozessbeschreibungen der Haupt-prozesse (Wareneingang, Kommissionierung, Versand,  ggf. Qualitätsprüfung) | / |
| 1. Lageplan (pdf bzw. dwg) | In diesem Fall ist das Baufeld schon vorgegeben |
| 1. Ansprechpartner Kunde | / |
| 1. Geheimhaltungsvereinbarung | / |
| 1. Sonstiges | / |
    ', 
    'I want to do it cheap.'),
    ('87d78389-0293-4245-9413-6b778a83e1bd', '22f7c9af-2a4b-4e5a-a695-a82530182405', 'Warehouse for Customer B', 
    '
    Fragenkatalog logistische Basisdaten Kunde B

**Inhalt**

[1 Wareneingang 1](#_Toc203464936)

[2 Lagerspiegel Fertigwaren 2](#_Toc203464937)

[3 Kommissionierung 2](#_Toc203464938)

[4 Versand 3](#_Toc203464939)

[5 Allgemein 3](#_Toc203464940)

|  |  |
| --- | --- |
| Wareneingang |  |
| 1. Anzahl Lieferungen pro Tag/ Monat/ Jahr | / |
| 1. Erfolgt die Anlieferung immer palettiert bzw. als Container? Ggfs. in welcher Form? | Immer auf Europaletten |
| 1. Abmessungen und Anteile der Ladungsträger (z.B. % Europalette 1.200 x 800,  % Industriepalette 1.200 x 1.000, Container, Kartontypen etc.) | / |
| 1. Anzahl Ladungsträger pro Tag/ Monat/ Jahr (Durchschnitt, Spitzen) | Im Durchschnitt 10 Paletten, in der Spitze 50 Paletten pro Stunde |
| 1. Werden die Lieferungen avisiert? | / |
| 1. Gibt es Chargen? | / |
| 1. Qualitätsprüfung: welche Anforderungen gibt es? | / |
| 1. Gibt es Cross-Docking o.ä.? | / |
| 1. Ggf. weitere Anforderungen in Bezug auf Vereinnahmung/ Lagerung/ …? | / |

|  |  |
| --- | --- |
| Lagerspiegel  Fertigwaren |  |
| 1. Anzahl Artikel | Ca. 4.000 Artikel |
| 1. Abmessungen (L x B x H, von-bis) | Passen alle in einen Behälter 600x400x320 mm und Palette 1200x800x1120 mm |
| 1. Gewichte Ladungsträger kplt. | Max. 50 kg und PAL max. 1000 kg |
| 1. Lagerkapazität (Stellplätze Ladungsträger), Mindestanforderung | 11.650 Behälterstellplätze  10.580 Palettenstellplätze |
| 1. Menge je Palette (Anzahl Fässer, Gebinde) | / |
| 1. Ladungssicherung | / |
| 1. Ggf. Artikelklassifizierung (ABC) | / |

|  |  |
| --- | --- |
| Kommissionierung |  |
| 1. Anzahl Aufträge/ Lieferscheine pro Tag/ Monat/ Jahr (Durchschnitt, Spitzenwerte) | Behälter: 340 Doppelspiele pro Stunde  Palette: 118 Doppelspiele pro Stunde |
| 1. ∅ Anzahl Auftragspositionen | / |
| 1. Saisonale Effekte? | / |
| 1. Tagesspitzen? | / |
| 1. Anzahl Anbruchpaletten | / |
| 1. Ggf. Analyse einer Auftragsliste eines aussagekräftigen Betrachtungszeitraumes mit Zeitstempel, Produkt-ID und Auftragszuordnung möglich? | / |
| 1. Durchschnittliche Bearbeitungszeit je Auftrag/Ladungsträger? | / |
| 1. Anzahl Kommissionierplätze | Ist zu definieren 🡪 Lösung sollte LLM herausfinden |

|  |  |
| --- | --- |
| Versand |  |
| 1. Anzahl Versandpaletten pro Tag/ Monat/ Jahr (Durchschnitt, Spitzenwerte) | / |
| 1. Ø Sendungsgröße: Anz. Paletten, Gewicht, Volumen | / |
| 1. Saisonale Effekte? | / |
| 1. Tagesspitzen (Abholfenster) ? | / |

|  |  |
| --- | --- |
| Allgemein |  |
| 1. Lagerstandorte und Funktion (Produktionslager, Versandlager etc.) | Produktionsversorgung und Versandpuffer |
| 1. Angaben zum Baufenster (L x B x H) | 70000 x 25000 x 33000 mm |
| 1. Ist-Personalbestand (WE, Komm., Versand, …) | / |
| 1. Arbeitszeiten / Schichtmodell (Produktion, innerwerklicher Transport, Versand) | 2-schichtig (16 h/Tag) |
| 1. Materialflussdiagramm SOLL bzw.  –beschreibung | Wird in diesem Fall nicht mehr gebraucht, steht im Fragenkatalog |
| 1. Wachstumserwartung - Sortiment - Durchsatz - Bestand, jew. geplante Entwicklung pro Jahr (für 5 – 10 Jahre) | Ist bereits in den Zahlen enthalten |
| 1. Prozessbeschreibungen der Haupt-prozesse (Wareneingang, Kommissionierung, Versand,  ggf. Qualitätsprüfung) | / |
| 1. Lageplan (pdf bzw. dwg) | In diesem Fall ist das Baufeld schon vorgegeben |
| 1. Ansprechpartner Kunde | / |
| 1. Geheimhaltungsvereinbarung | / |
| 1. Sonstiges | / |
    ', 
    'I want to do it fast.');
