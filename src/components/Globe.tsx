import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import GlobeGL from 'globe.gl';

// Définition des zones géographiques avec leurs pays
const zones: Record<string, string[]> = {
  europe: [
    'United Kingdom', 'France', 'Germany', 'Belgium', 'Netherlands',
    'Luxembourg', 'Denmark', 'Sweden', 'Norway', 'Finland',
    'Ireland', 'Austria', 'Switzerland', 'Poland', 'Czech Republic',
    'Czechia', 'Slovakia', 'Hungary', 'Estonia', 'Latvia', 'Lithuania',
    'Portugal', 'Spain', 'Italy', 'Greece', 'Romania', 'Bulgaria',
    'Slovenia', 'Croatia', 'Serbia', 'Bosnia and Herzegovina', 'Montenegro',
    'Albania', 'North Macedonia', 'Kosovo'
  ],
  africa: [
    'Nigeria', 'Kenya', 'South Africa', 'Egypt', 'Morocco', 'Senegal',
    'Ghana', 'Democratic Republic of the Congo', 'Tanzania', 'Ethiopia',
    'Algeria', 'Tunisia', 'Libya', 'Sudan', 'South Sudan', 'Uganda',
    'Rwanda', 'Cameroon', 'Ivory Coast', "Côte d'Ivoire", 'Mali', 'Niger',
    'Burkina Faso', 'Benin', 'Togo', 'Mozambique', 'Zimbabwe', 'Zambia',
    'Botswana', 'Namibia', 'Angola', 'Madagascar', 'Mauritius'
  ],
  middleEast: [
    'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain',
    'Oman', 'Yemen', 'Iraq', 'Iran', 'Jordan', 'Lebanon', 'Syria',
    'Israel', 'Palestine', 'Turkey'
  ],
  southAmerica: [
    'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela',
    'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'Guyana', 'Suriname',
    'French Guiana'
  ],
  northAmerica: [
    'United States of America', 'Canada', 'Mexico', 'Guatemala', 'Honduras',
    'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Cuba',
    'Dominican Republic', 'Haiti', 'Jamaica', 'Puerto Rico'
  ],
  asia: [
    'China', 'Japan', 'South Korea', 'North Korea', 'India', 'Pakistan',
    'Bangladesh', 'Vietnam', 'Thailand', 'Indonesia', 'Philippines',
    'Malaysia', 'Singapore', 'Myanmar', 'Cambodia', 'Laos', 'Nepal',
    'Sri Lanka', 'Mongolia', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan',
    'Tajikistan', 'Kyrgyzstan', 'Afghanistan'
  ],
  oceania: [
    'Australia', 'New Zealand', 'Papua New Guinea', 'Fiji', 'Solomon Islands',
    'Vanuatu', 'New Caledonia', 'Samoa', 'Tonga'
  ]
};

// Noms des zones en français
const zoneNames: Record<string, string> = {
  europe: 'EUROPE DU NORD',
  africa: 'AFRIQUE',
  middleEast: 'MOYEN-ORIENT',
  southAmerica: 'AMÉRIQUE DU SUD',
  northAmerica: 'AMÉRIQUE DU NORD',
  asia: 'ASIE',
  oceania: 'OCÉANIE'
};

// Marqueurs avec leur zone et pays associés
const markers = [
  // Europe
  { lat: 51.5074, lng: -0.1278, name: 'Londres', zone: 'europe', country: 'Royaume-Uni' },
  { lat: 48.8566, lng: 2.3522, name: 'Paris', zone: 'europe', country: 'France' },
  { lat: 50.6292, lng: 3.0573, name: 'Lille', zone: 'europe', country: 'France' },
  { lat: 45.7640, lng: 4.8357, name: 'Lyon', zone: 'europe', country: 'France' },
  { lat: 43.2965, lng: 5.3698, name: 'Marseille', zone: 'europe', country: 'France' },
  { lat: 52.5200, lng: 13.4050, name: 'Berlin', zone: 'europe', country: 'Allemagne' },
  { lat: 51.2277, lng: 6.7735, name: 'Düsseldorf', zone: 'europe', country: 'Allemagne' },
  { lat: 53.5511, lng: 9.9937, name: 'Hambourg', zone: 'europe', country: 'Allemagne' },
  { lat: 50.8503, lng: 4.3517, name: 'Bruxelles', zone: 'europe', country: 'Belgique' },
  { lat: 52.3676, lng: 4.9041, name: 'Amsterdam', zone: 'europe', country: 'Pays-Bas' },
  { lat: 53.3498, lng: -6.2603, name: 'Dublin', zone: 'europe', country: 'Irlande' },
  { lat: 52.2297, lng: 21.0122, name: 'Varsovie', zone: 'europe', country: 'Pologne' },

  // Afrique
  { lat: 6.5244, lng: 3.3792, name: 'Lagos', zone: 'africa', country: 'Nigeria' },
  { lat: -1.2921, lng: 36.8219, name: 'Nairobi', zone: 'africa', country: 'Kenya' },
  { lat: -33.9249, lng: 18.4241, name: 'Le Cap', zone: 'africa', country: 'Afrique du Sud' },
  { lat: 30.0444, lng: 31.2357, name: 'Le Caire', zone: 'africa', country: 'Égypte' },
  { lat: 33.5731, lng: -7.5898, name: 'Casablanca', zone: 'africa', country: 'Maroc' },
  { lat: 14.6928, lng: -17.4467, name: 'Dakar', zone: 'africa', country: 'Sénégal' },

  // Moyen-Orient
  { lat: 25.2048, lng: 55.2708, name: 'Dubaï', zone: 'middleEast', country: 'Émirats Arabes Unis' },
  { lat: 41.0082, lng: 28.9784, name: 'Istanbul', zone: 'middleEast', country: 'Turquie' },

  // Amérique du Sud
  { lat: -22.9068, lng: -43.1729, name: 'Rio de Janeiro', zone: 'southAmerica', country: 'Brésil' },
  { lat: -34.6037, lng: -58.3816, name: 'Buenos Aires', zone: 'southAmerica', country: 'Argentine' },
  { lat: -23.5505, lng: -46.6333, name: 'São Paulo', zone: 'southAmerica', country: 'Brésil' },

  // Amérique du Nord
  { lat: 40.7128, lng: -74.0060, name: 'New York', zone: 'northAmerica', country: 'États-Unis' },
  { lat: 34.0522, lng: -118.2437, name: 'Los Angeles', zone: 'northAmerica', country: 'États-Unis' },
  { lat: 45.5017, lng: -73.5673, name: 'Montréal', zone: 'northAmerica', country: 'Canada' },

  // Asie
  { lat: 35.6762, lng: 139.6503, name: 'Tokyo', zone: 'asia', country: 'Japon' },
  { lat: 31.2304, lng: 121.4737, name: 'Shanghai', zone: 'asia', country: 'Chine' },
  { lat: 1.3521, lng: 103.8198, name: 'Singapour', zone: 'asia', country: 'Singapour' },
  { lat: 22.3193, lng: 114.1694, name: 'Hong Kong', zone: 'asia', country: 'Chine' },

  // Océanie
  { lat: -33.8688, lng: 151.2093, name: 'Sydney', zone: 'oceania', country: 'Australie' },
  { lat: -37.8136, lng: 144.9631, name: 'Melbourne', zone: 'oceania', country: 'Australie' },
];

// Fonction pour trouver la zone d'un pays
const getZoneForCountry = (countryName: string): string | null => {
  for (const [zone, countries] of Object.entries(zones)) {
    if (countries.includes(countryName)) {
      return zone;
    }
  }
  return null;
};

interface MarkerData {
  lat: number;
  lng: number;
  name: string;
  zone: string;
  country: string;
}

interface CountryFeature {
  properties?: {
    ADMIN?: string;
  };
}

export default function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const [activeZone, setActiveZone] = useState<string | null>('europe');

  const isCountryInActiveZone = useCallback((countryName: string) => {
    if (!activeZone) return false;
    return zones[activeZone]?.includes(countryName) || false;
  }, [activeZone]);

  // Grouper les marqueurs par pays pour la zone active
  const groupedMarkers = useMemo(() => {
    if (!activeZone) return {};

    const zoneMarkers = markers.filter(m => m.zone === activeZone);
    const grouped: Record<string, string[]> = {};

    zoneMarkers.forEach(marker => {
      if (!grouped[marker.country]) {
        grouped[marker.country] = [];
      }
      grouped[marker.country].push(marker.name);
    });

    return grouped;
  }, [activeZone]);

  useEffect(() => {
    if (!containerRef.current) return;

    const globe = new GlobeGL(containerRef.current)
      .backgroundColor('#000000')
      .showAtmosphere(false)
      .showGlobe(true)
      .globeImageUrl('')
      .width(containerRef.current.clientWidth)
      .height(containerRef.current.clientHeight);

    globeRef.current = globe;

    fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(countries => {
        globe
          .hexPolygonsData(countries.features)
          .hexPolygonResolution(3)
          .hexPolygonMargin(0.4)
          .hexPolygonUseDots(true)
          .hexPolygonAltitude(0.01);

        globe
          .pointsData(markers)
          .pointLat('lat')
          .pointLng('lng')
          .pointAltitude(0.02)
          .pointRadius(0.6)
          .pointsMerge(false);

        globe
          .ringsData(markers)
          .ringLat('lat')
          .ringLng('lng')
          .ringMaxRadius(1.2)
          .ringPropagationSpeed(0)
          .ringRepeatPeriod(0);

        globe.onPointClick((point: object) => {
          const marker = point as MarkerData;
          setActiveZone(prev => prev === marker.zone ? null : marker.zone);
        });

        globe.onHexPolygonClick((polygon: object) => {
          const feature = polygon as CountryFeature;
          const countryName = feature.properties?.ADMIN || '';
          const zone = getZoneForCountry(countryName);
          if (zone) {
            setActiveZone(prev => prev === zone ? null : zone);
          }
        });
      });

    globe.pointOfView({ lat: 20, lng: 10, altitude: 2.5 });

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.3;
    globe.controls().enableZoom = true;

    const handleResize = () => {
      if (containerRef.current && globeRef.current) {
        globeRef.current
          .width(containerRef.current.clientWidth)
          .height(containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (globeRef.current) {
        globeRef.current._destructor?.();
      }
    };
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;

    const globe = globeRef.current;

    globe.hexPolygonColor((d: CountryFeature) => {
      const countryName = d.properties?.ADMIN || '';
      if (isCountryInActiveZone(countryName)) {
        return '#D97706';
      }
      return 'rgba(255, 255, 255, 0.7)';
    });

    globe.pointColor((d: object) => {
      const marker = d as MarkerData;
      return marker.zone === activeZone ? '#FFECE8' : '#000000';
    });

    globe.ringColor((d: object) => () => {
      const marker = d as MarkerData;
      return marker.zone === activeZone ? '#000000' : '#FFFFFF';
    });

  }, [activeZone, isCountryInActiveZone]);

  // Convertir l'objet groupé en tableau pour l'affichage en colonnes
  const countryEntries = Object.entries(groupedMarkers);
  const midPoint = Math.ceil(countryEntries.length / 2);
  const leftColumn = countryEntries.slice(0, midPoint);
  const rightColumn = countryEntries.slice(midPoint);

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      background: '#000000',
    }}>
      {/* Panneau gauche */}
      <div style={{
        width: '400px',
        minWidth: '400px',
        padding: '60px 50px',
        display: 'flex',
        flexDirection: 'column',
        color: '#FFFFFF',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        {activeZone && (
          <>
            {/* Titre de la zone */}
            <h1 style={{
              fontSize: '32px',
              fontWeight: 400,
              letterSpacing: '2px',
              marginBottom: '40px',
              lineHeight: 1.2,
            }}>
              {zoneNames[activeZone]}
            </h1>

            {/* Siège social indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '30px',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#FFFFFF',
                marginTop: '6px',
              }} />
              <span style={{
                fontSize: '11px',
                letterSpacing: '2px',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.5,
              }}>
                SIÈGE<br />SOCIAL
              </span>
            </div>

            {/* Liste des pays et villes en 2 colonnes */}
            <div style={{
              display: 'flex',
              gap: '40px',
            }}>
              {/* Colonne gauche */}
              <div style={{ flex: 1 }}>
                {leftColumn.map(([country, cities]) => (
                  <div key={country} style={{ marginBottom: '25px' }}>
                    <h3 style={{
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '2px',
                      marginBottom: '8px',
                      color: '#FFFFFF',
                      textDecoration: 'underline',
                      textUnderlineOffset: '4px',
                    }}>
                      {country.toUpperCase()}
                    </h3>
                    {cities.map(city => (
                      <p key={city} style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.7)',
                        margin: '4px 0',
                        letterSpacing: '0.5px',
                      }}>
                        {city.toUpperCase()}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              {/* Colonne droite */}
              <div style={{ flex: 1 }}>
                {rightColumn.map(([country, cities]) => (
                  <div key={country} style={{ marginBottom: '25px' }}>
                    <h3 style={{
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '2px',
                      marginBottom: '8px',
                      color: '#FFFFFF',
                      textDecoration: 'underline',
                      textUnderlineOffset: '4px',
                    }}>
                      {country.toUpperCase()}
                    </h3>
                    {cities.map(city => (
                      <p key={city} style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.7)',
                        margin: '4px 0',
                        letterSpacing: '0.5px',
                      }}>
                        {city.toUpperCase()}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Globe */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          height: '100%',
        }}
      />
    </div>
  );
}
