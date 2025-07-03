export const COFFEE_DATA = [
  {
    id: '1',
    name: 'Espresso',
    price: 3.50,
    description: 'Rich and bold espresso shot',
    image: require('../../assets/espresso.png'),
    category: 'Hot Coffee'
  },
  {
    id: '2',
    name: 'Latte',
    price: 4.75,
    description: 'Smooth espresso with steamed milk',
    image: require('../../assets/latte.png'),
    category: 'Hot Coffee'
  },
  {
    id: '3',
    name: 'Cappuccino',
    price: 4.50,
    description: 'Espresso with steamed milk and foam',
    image: require('../../assets/cappucino.png'),
    category: 'Hot Coffee'
  },
  {
    id: '4',
    name: 'Americano',
    price: 3.25,
    description: 'Espresso diluted with hot water',
    image: require('../../assets/americano.png'),
    category: 'Hot Coffee'
  },
  {
    id: '5',
    name: 'Iced Coffee',
    price: 3.75,
    description: 'Cold brew coffee over ice',
    image: require('../../assets/latte.png'),
    category: 'Cold Coffee'
  },
  {
    id: '6',
    name: 'Frappuccino',
    price: 5.50,
    description: 'Blended coffee with ice and cream',
    image: require('../../assets/frappucino.png'),
    category: 'Cold Coffee'
  },
  {
    id: '7',
    name: 'Mocha',
    price: 5.25,
    description: 'Espresso with chocolate and steamed milk',
    image: require('../../assets/mocha.png'),
    category: 'Specialty'
  },
  {
    id: '8',
    name: 'Macchiato',
    price: 4.25,
    description: 'Espresso with a dollop of steamed milk',
    image: require('../../assets/macchiato.png'),
    category: 'Specialty'
  }
];

export const DRINK_SIZES = [
  { id: 'small', name: 'Small', multiplier: 1.0 },
  { id: 'medium', name: 'Medium', multiplier: 1.3 },
  { id: 'large', name: 'Large', multiplier: 1.6 }
];

export const SWEETNESS_LEVELS = [
  { id: 'none', name: 'No Sugar', multiplier: 1.0 },
  { id: 'low', name: 'Light Sweet', multiplier: 1.0 },
  { id: 'medium', name: 'Medium Sweet', multiplier: 1.0 },
  { id: 'high', name: 'Extra Sweet', multiplier: 1.0 }
];

export const ICE_LEVELS = [
  { id: 'none', name: 'No Ice' },
  { id: 'light', name: 'Light Ice' },
  { id: 'regular', name: 'Regular Ice' },
  { id: 'extra', name: 'Extra Ice' }
];
