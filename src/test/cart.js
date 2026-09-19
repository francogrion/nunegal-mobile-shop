import { CART_STORAGE_KEY } from '../store/cartStore.js'

// Cart lines as stored by the cart store, for tests that start with products
// already in the cart (e.g. from a previous visit).
export const cartLines = {
  iconiaTalkS: {
    lineId: 'ZmGrkLRPXOTpxsU4jjAcv:2001:1000',
    productId: 'ZmGrkLRPXOTpxsU4jjAcv',
    brand: 'Acer',
    model: 'Iconia Talk S',
    imageUrl:
      'https://itx-frontend-test.onrender.com/images/ZmGrkLRPXOTpxsU4jjAcv.jpg',
    price: 170,
    storageCode: 2001,
    storageName: '32 GB',
    colorCode: 1000,
    colorName: 'Black',
    quantity: 2,
  },
  liquidZ6Plus: {
    lineId: 'cGjFJlmqNPIwU59AOcY8H:2000:1001',
    productId: 'cGjFJlmqNPIwU59AOcY8H',
    brand: 'Acer',
    model: 'Liquid Z6 Plus',
    imageUrl:
      'https://itx-frontend-test.onrender.com/images/cGjFJlmqNPIwU59AOcY8H.jpg',
    price: 250,
    storageCode: 2000,
    storageName: '16 GB',
    colorCode: 1001,
    colorName: 'White',
    quantity: 1,
  },
}

export function seedCart(lines) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines))
}
