import type { Timeline } from '../domain/types';

export const magellan: Timeline = {
  id: 'magellan',
  theme: 'Histoire',
  title: 'Le premier tour du monde',
  subtitle: 'L’expédition Magellan–Elcano · 1519 – 1522',
  intro:
    'Cinq navires et environ 240 hommes quittent l’Espagne pour atteindre les îles aux épices par l’ouest. Trois ans plus tard, un seul bateau rentre, avec 18 survivants : ils viennent de prouver, par l’expérience, que la Terre se contourne.',
  accent: '#f2b84b',
  defaultZoom: 4.2,
  credits: 'Dates du calendrier julien, d’après le journal d’Antonio Pigafetta.',
  events: [
    {
      id: 'seville',
      date: '1519-08-10',
      title: 'L’Armada de Molucca quitte Séville',
      place: 'Séville, Castille',
      coords: [-5.9926, 37.3826],
      zoom: 6,
      description:
        'Financée par Charles Quint, la flotte de cinq nefs — Trinidad, San Antonio, Concepción, Victoria et Santiago — descend le Guadalquivir. Fernand de Magellan, navigateur portugais au service de l’Espagne, veut prouver que les Moluques se trouvent dans la moitié du monde attribuée à la Castille.',
      tags: ['Départ'],
    },
    {
      id: 'sanlucar',
      date: '1519-09-20',
      title: 'Départ vers l’océan',
      place: 'Sanlúcar de Barrameda',
      coords: [-6.3536, 36.7781],
      zoom: 6,
      description:
        'Après cinq semaines d’attente à l’embouchure du fleuve, la flotte prend enfin la mer. À bord, Antonio Pigafetta, un jeune Vénitien, tiendra le journal qui nous fait connaître toute l’aventure.',
    },
    {
      id: 'tenerife',
      date: '1519-09-26',
      title: 'Escale aux Canaries',
      place: 'Tenerife, îles Canaries',
      coords: [-16.2518, 28.4636],
      zoom: 5,
      description:
        'Dernier ravitaillement en eau, bois et vivres avant la traversée de l’Atlantique. Magellan y apprend que des capitaines espagnols de sa propre flotte complotent contre lui.',
    },
    {
      id: 'rio',
      date: '1519-12-13',
      title: 'La baie de Rio de Janeiro',
      place: 'Baie de Guanabara, Brésil',
      coords: [-43.1729, -22.9068],
      description:
        'Après le pot-au-noir et ses calmes interminables, la flotte mouille dans la baie. Les équipages échangent avec les Tupis des hameçons et des couteaux contre des vivres frais.',
    },
    {
      id: 'plata',
      date: '1520-01-10',
      title: 'Fausse piste au Río de la Plata',
      place: 'Estuaire du Río de la Plata',
      coords: [-56.16, -34.9],
      description:
        'L’immense estuaire laisse espérer le passage vers l’autre océan. Des semaines d’exploration révèlent qu’il ne s’agit que d’un fleuve : il faut continuer vers le sud, dans des eaux de plus en plus froides.',
    },
    {
      id: 'san-julian',
      date: '1520-03-31',
      title: 'Hivernage et mutinerie',
      place: 'Puerto San Julián, Patagonie',
      coords: [-67.7186, -49.3087],
      description:
        'La flotte hiverne dans une baie glaciale. Le 1er avril, trois capitaines se mutinent ; Magellan reprend le contrôle par la ruse et la force. Plus tard, le Santiago, parti en reconnaissance, fait naufrage.',
      tags: ['Mutinerie'],
    },
    {
      id: 'detroit',
      date: '1520-10-21',
      title: 'L’entrée du détroit',
      place: 'Cap des Vierges, Patagonie',
      coords: [-68.35, -52.33],
      zoom: 5,
      description:
        'Magellan découvre le passage qui portera son nom : un labyrinthe de chenaux de près de 600 km. Pendant l’exploration, le San Antonio fait demi-tour et rentre en Espagne avec une grande partie des vivres.',
      tags: ['Découverte'],
    },
    {
      id: 'pacifique',
      date: '1520-11-28',
      title: 'Débouché sur la « mer Pacifique »',
      place: 'Cabo Deseado, Terre de Feu',
      coords: [-74.7, -52.73],
      zoom: 5,
      via: [[-72.3, -53.6]],
      description:
        'Les trois navires restants sortent du détroit. Magellan nomme l’océan « Pacifique » pour ses eaux calmes, sans imaginer son immensité : il pense atteindre les Moluques en quelques jours.',
    },
    {
      id: 'guam',
      date: '1521-03-06',
      title: 'Terre ! Après 99 jours de mer',
      place: 'Guam, îles Mariannes',
      coords: [144.7937, 13.4443],
      via: [
        [-76, -40],
        [-80, -28],
        [-138.8, -14.8],
        [-151.8, -11.4],
        [-175, 9],
      ],
      description:
        'La traversée est un calvaire : biscuit infesté de vers, cuir bouilli, rats vendus à prix d’or. Le scorbut tue une vingtaine d’hommes. Deux îlots seulement sont aperçus en trois mois.',
      tags: ['Traversée'],
    },
    {
      id: 'limasawa',
      date: '1521-03-28',
      title: 'Arrivée aux Philippines',
      place: 'Limasawa, Visayas',
      coords: [125.08, 9.93],
      zoom: 6,
      description:
        'Enrique, l’esclave malais de Magellan, comprend la langue des habitants : certains historiens voient en lui le premier homme à avoir bouclé le tour du monde. Le 31 mars, une messe est célébrée sur l’île.',
    },
    {
      id: 'mactan',
      date: '1521-04-27',
      title: 'Mort de Magellan à Mactan',
      place: 'Mactan, près de Cebu',
      coords: [124.0102, 10.3109],
      zoom: 7,
      links: ['seville'],
      description:
        'Voulant imposer l’autorité espagnole au chef Lapulapu, Magellan débarque avec une cinquantaine d’hommes. Repoussé dans les hauts-fonds, il est tué. Lapulapu est aujourd’hui un héros national aux Philippines.',
      tags: ['Bataille'],
    },
    {
      id: 'tidore',
      date: '1521-11-08',
      title: 'Les îles aux épices',
      place: 'Tidore, Moluques',
      coords: [127.4, 0.68],
      zoom: 6,
      description:
        'Après avoir brûlé la Concepción faute d’équipage, la Trinidad et la Victoria atteignent enfin leur but. Elles chargent des tonnes de clous de girofle, une épice qui vaut alors plus que son poids en argent.',
      tags: ['Objectif'],
    },
    {
      id: 'timor',
      date: '1522-02-11',
      title: 'La Victoria prend le large',
      place: 'Timor',
      coords: [124.4, -9.4],
      zoom: 5,
      description:
        'La Trinidad, qui prend l’eau, est restée à Tidore. Juan Sebastián Elcano, désormais capitaine de la Victoria, choisit une route audacieuse : traverser l’océan Indien sans escale pour éviter les Portugais.',
    },
    {
      id: 'bonne-esperance',
      date: '1522-05',
      title: 'Le cap de Bonne-Espérance',
      place: 'Pointe de l’Afrique australe',
      coords: [18.4734, -34.3568],
      description:
        'Après des semaines contre les vents d’ouest, la Victoria double enfin le cap. L’équipage se nourrit de riz et meurt de faim et de scorbut, mais Elcano refuse d’accoster en territoire portugais.',
    },
    {
      id: 'cap-vert',
      date: '1522-07-09',
      title: 'Le jour perdu',
      place: 'Santiago, Cap-Vert',
      coords: [-23.5087, 14.9315],
      zoom: 6,
      description:
        'À court de vivres, l’équipage accoste en se faisant passer pour des rescapés d’Amérique. Les marins découvrent qu’ils ont « perdu » un jour : en tournant autour du globe vers l’ouest, leur calendrier a pris 24 heures de retard. Treize hommes sont arrêtés par les Portugais.',
      tags: ['Science'],
    },
    {
      id: 'retour',
      date: '1522-09-06',
      title: 'Retour de la Victoria',
      place: 'Sanlúcar de Barrameda',
      coords: [-6.3536, 36.7781],
      zoom: 6,
      links: ['sanlucar'],
      description:
        '18 survivants, épuisés, ramènent la Victoria au point de départ. Deux jours plus tard, ils marchent pieds nus jusqu’à l’église de Séville. Le tour du monde est accompli : environ 70 000 km en trois ans.',
      tags: ['Arrivée'],
    },
  ],
};
