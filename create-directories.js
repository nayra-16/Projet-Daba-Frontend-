import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directories = [
  'src/core/components',
  'src/core/constants',
  'src/core/context',
  'src/core/layouts',
  'src/core/services',
  'src/modules/home/components',
  'src/modules/home/pages',
  'src/modules/about/pages',
  'src/modules/products/components',
  'src/modules/products/pages',
  'src/modules/products/services',
  'src/modules/products/types',
  'src/modules/cart/pages',
  'src/modules/cart/checkout',
  'src/modules/orders/services',
  'src/modules/orders/types',
  'src/modules/contact/pages',
  'src/modules/contact/services',
  'src/modules/services/pages',
  'src/modules/auth/pages',
  'src/modules/farm/pages',
  'src/modules/farm/services',
  'src/modules/farm/types',
  'src/shared/types',
  'src/shared/utils'
];

directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  fs.mkdirSync(fullPath, { recursive: true });
  console.log(`Created directory: ${fullPath}`);
});

console.log('All directories created successfully!');
