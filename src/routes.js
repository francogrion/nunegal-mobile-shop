import { generatePath } from 'react-router'

export const PRODUCT_PATH = '/product/:productId'

export const productPath = (productId) =>
  generatePath(PRODUCT_PATH, { productId })
