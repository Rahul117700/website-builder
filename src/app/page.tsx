import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { findSubdomainForHost } from '../lib/domainUtils';
import HomePageClient from './HomePageClient';

export default async function HomePage() {
  const headersList = await headers();
  const host = headersList.get('host');
  
  console.log('🌐 [Root Page] Checking host:', host);
  
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1') && !host.includes('31.97.233.221')) {
    try {
      console.log('🔍 [Root Page] Looking up subdomain for host:', host);
      
      const subdomain = await findSubdomainForHost(host);
      
      if (subdomain) {
        console.log(`✅ [Root Page] Redirecting ${host} to /s/${subdomain}`);
        redirect(`/s/${subdomain}`);
      } else {
        console.log(`❌ [Root Page] No subdomain found for host: ${host}`);
      }
    } catch (error) {
      console.error('❌ [Root Page] Error resolving domain:', error);
    }
  }
  
  // Show main page if no domain match or localhost
  console.log('🏠 [Root Page] Showing main page for host:', host);
  return <HomePageClient />;
}
