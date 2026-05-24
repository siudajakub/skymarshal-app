# Lista wykorzystanych źródeł danych

Zgodnie z wymaganiami formalnymi (Kryterium nr 3), poniżej znajduje się lista publicznych, rzeczywistych źródeł danych wykorzystanych w aplikacji SKYMARSHAL C2 Dispatch System:

1. **Polska Agencja Żeglugi Powietrznej (PAŻP) - AIP Polska**
   - Oficjalne informacje lotnicze (Aeronautical Information Publication) dla polskiej przestrzeni powietrznej.
   - [https://ais.pansa.pl](https://ais.pansa.pl)

2. **PAŻP DroneTower**
   - Narzędzie wspierające zgłaszanie lotów oraz dostarczające informacje o strefach lotniczych (m.in. DRA-P/DRA-R).
   - [https://dronetower.pansa.pl](https://dronetower.pansa.pl)
   - Informacje PAŻP o strefach geograficznych BSP i obowiązku sprawdzania ograniczeń przed lotem: [https://www.pansa.pl/en/strefy-geograficzne/](https://www.pansa.pl/en/strefy-geograficzne/)

3. **Przepisy lotnicze dla dronów (EASA & ULC)**
   - Wymagania i regulacje dotyczące operacji dronów w kategorii Otwartej (Open, np. do wysokości 120m AGL) oraz Szczególnej (Specific, w tym scenariusze standardowe STS).
   - EASA Civil Drones: [https://www.easa.europa.eu/en/domains/civil-drones-rpas](https://www.easa.europa.eu/en/domains/civil-drones-rpas)
   - ULC Drony: [https://drony.ulc.gov.pl](https://drony.ulc.gov.pl)
   - ULC, kategoria otwarta i limit 120 m od najbliższego punktu powierzchni ziemi: [https://ulc.gov.pl/pl/drony/kategoria-otwarta-informacje](https://ulc.gov.pl/pl/drony/kategoria-otwarta-informacje)

4. **OpenStreetMap (OSM)**
   - Otwarte dane geoprzestrzenne używane do wizualizacji mapy bazowej oraz wykrywania kandydatów infrastruktury krytycznej.
   - Przydatne tagi: `power=plant`, `power=substation`, `man_made=water_works`, `utility=water`, `amenity=hospital`, `railway=*`, `bridge=yes`.
   - [https://www.openstreetmap.org](https://www.openstreetmap.org)

5. **Open Infrastructure Map**
   - Wizualizacja infrastruktury energetycznej, telekomunikacyjnej, wodnej, paliwowej i transportowej oparta na danych OpenStreetMap. Przydatna jako szybki przegląd obiektów wymagających koordynacji przed lotem.
   - [https://openinframap.org](https://openinframap.org)

6. **Huta Stalowa Wola (HSW S.A.)**
   - Oficjalna strona internetowa podmiotu infrastruktury kluczowej. Okrąg HSW w aplikacji jest operacyjną warstwą modelową prototypu, używaną do demonstracji autoryzacji i omijania obszarów wrażliwych.
   - [https://hsw.pl](https://hsw.pl)

7. **Elektrociepłownia Stalowa Wola (ECSW S.A.)**
   - Oficjalna strona internetowa obiektu infrastruktury krytycznej. Bufor ECSW w aplikacji jest warstwą demonstracyjną ryzyka EM/GNSS, nie oficjalnie publikowaną strefą lotniczą.
   - [https://www.ec-sw.pl](https://www.ec-sw.pl)

8. **GUGiK / Geoportal – WMS, WMTS, WFS**
   - Rządowe usługi danych przestrzennych udostępniane przez Główny Urząd Geodezji i Kartografii. W aplikacji używana jest ortofotomapa WMS, a do przyszłego pobierania infrastruktury wskazane są BDOT10k, GESUT/KIUT, KIBDOT, NMT/DSM i dane adresowe.
   - Strona usług przeglądania WMS/WMTS: [https://www.geoportal.gov.pl/en/services/view-services-wms-and-wmts/](https://www.geoportal.gov.pl/en/services/view-services-wms-and-wmts/)
   - [https://mapy.geoportal.gov.pl](https://mapy.geoportal.gov.pl)

9. **ULC – gdzie można latać dronem**
   - Informacja ULC wskazuje, że strefy geograficzne BSP mogą umożliwiać, ograniczać albo wykluczać operacje, a przed startem należy wykonać check-in w DroneTower i sprawdzić warunki w czasie rzeczywistym.
   - [https://ulc.gov.pl/drony/informacje-ogolne/czesto-zadawane-pytania-faq/pytania-ogolne/gdzie-moge-latac-swoim-dronem](https://ulc.gov.pl/drony/informacje-ogolne/czesto-zadawane-pytania-faq/pytania-ogolne/gdzie-moge-latac-swoim-dronem)

10. **Creotech – usługi geoprzestrzenne / CreoScan / GREY**
   - Publiczny benchmark funkcjonalny: Creotech opisuje wsparcie operacji BSP od planowania lotu, przez monitoring w 3D, po analizę danych; CreoScan obejmuje planowanie, monitoring i analizę w środowisku 3D, a GREY generuje profil terenu, mapy ryzyka i informacje o przeszkodach.
   - [https://creotech.pl/pl/uslugi-geoprzestrzenne/](https://creotech.pl/pl/uslugi-geoprzestrzenne/)
