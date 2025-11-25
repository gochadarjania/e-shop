import Navbar from '@/components/client/Navbar';
import Footer from '@/components/client/Footer';
import { ClientAuthProvider } from '@/lib/context/ClientAuthContext';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </ClientAuthProvider>
  );
}
