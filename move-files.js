import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const moves = [
  // Core components
  { src: 'src/components/Loader.tsx', dest: 'src/core/components/Loader.tsx' },
  { src: 'src/components/ScrollToTop.tsx', dest: 'src/core/components/ScrollToTop.tsx' },
  { src: 'src/components/TopBar.tsx', dest: 'src/core/components/TopBar.tsx' },
  { src: 'src/components/Navbar.tsx', dest: 'src/core/components/Navbar.tsx' },
  { src: 'src/components/Footer.tsx', dest: 'src/core/components/Footer.tsx' },
  // Core constants
  { src: 'src/constants/index.ts', dest: 'src/core/constants/index.ts' },
  // Core context
  { src: 'src/context/CartContext.tsx', dest: 'src/core/context/CartContext.tsx' },
  // Core layout
  { src: 'src/layouts/MainLayout.tsx', dest: 'src/core/layouts/MainLayout.tsx' },
  // Core API service
  { src: 'src/services/api.ts', dest: 'src/core/services/api.ts' },

  // Home module
  { src: 'src/components/Hero.tsx', dest: 'src/modules/home/components/Hero.tsx' },
  { src: 'src/components/Advantages.tsx', dest: 'src/modules/home/components/Advantages.tsx' },
  { src: 'src/components/AboutSection.tsx', dest: 'src/modules/home/components/AboutSection.tsx' },
  { src: 'src/components/Expertise.tsx', dest: 'src/modules/home/components/Expertise.tsx' },
  { src: 'src/components/FeaturedProducts.tsx', dest: 'src/modules/home/components/FeaturedProducts.tsx' },
  { src: 'src/components/WhyChooseUs.tsx', dest: 'src/modules/home/components/WhyChooseUs.tsx' },
  { src: 'src/components/CTASection.tsx', dest: 'src/modules/home/components/CTASection.tsx' },
  { src: 'src/components/Testimonials.tsx', dest: 'src/modules/home/components/Testimonials.tsx' },
  { src: 'src/pages/Home.tsx', dest: 'src/modules/home/pages/Home.tsx' },

  // About module
  { src: 'src/pages/About.tsx', dest: 'src/modules/about/pages/About.tsx' },

  // Products module
  { src: 'src/pages/Products.tsx', dest: 'src/modules/products/pages/Products.tsx' },
  { src: 'src/services/productService.ts', dest: 'src/modules/products/services/productService.ts' },
  { src: 'src/assets/products', dest: 'src/modules/products/assets' },

  // Cart & Checkout module
  { src: 'src/pages/Cart.tsx', dest: 'src/modules/cart/pages/Cart.tsx' },
  { src: 'src/pages/Checkout.tsx', dest: 'src/modules/cart/checkout/Checkout.tsx' },

  // Orders module
  { src: 'src/services/orderService.ts', dest: 'src/modules/orders/services/orderService.ts' },

  // Contact module
  { src: 'src/pages/Contact.tsx', dest: 'src/modules/contact/pages/Contact.tsx' },
  { src: 'src/services/contactService.ts', dest: 'src/modules/contact/services/contactService.ts' },

  // Services page module
  { src: 'src/pages/Services.tsx', dest: 'src/modules/services/pages/Services.tsx' },

  // Auth module
  { src: 'src/pages/Login.tsx', dest: 'src/modules/auth/pages/Login.tsx' },

  // Farm module
  { src: 'src/pages/farm/FarmManagement.tsx', dest: 'src/modules/farm/pages/FarmManagement.tsx' },
  { src: 'src/pages/farm/FarmDetail.tsx', dest: 'src/modules/farm/pages/FarmDetail.tsx' },
  { src: 'src/services/farmService.ts', dest: 'src/modules/farm/services/farmService.ts' },
  { src: 'src/types/farm.ts', dest: 'src/modules/farm/types/index.ts' },

  // Shared types
  { src: 'src/types/index.ts', dest: 'src/shared/types/common.ts' },
];

moves.forEach(({ src, dest }) => {
  const srcPath = path.join(__dirname, src);
  const destPath = path.join(__dirname, dest);

  if (!fs.existsSync(srcPath)) {
    console.warn(`Source not found: ${src}`);
    return;
  }

  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.renameSync(srcPath, destPath);
  console.log(`Moved: ${src} → ${dest}`);
});

console.log('All files moved successfully!');
