import { NextResponse } from 'next/server';
import { blogPosts } from '@/data/blogs';

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Sort posts by published date (newest first)
  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const rssItems = sortedPosts
    .slice(0, 50) // Limit to 50 most recent posts
    .map((post) => {
      const postUrl = `${baseUrl}/blog/${post.slug}`;
      const pubDate = new Date(post.publishedAt).toUTCString();
      
      // Clean content for RSS (remove markdown formatting)
      const cleanContent = post.content
        .replace(/#{1,6}\s/g, '') // Remove markdown headers
        .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.+?)\*/g, '$1') // Remove italic
        .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove markdown links
        .substring(0, 500) // Limit length
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <content:encoded><![CDATA[${cleanContent}...]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${post.category}]]></category>
      <author>${post.author}</author>
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Sell Earn Direct Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Learn how to sell digital products, create sales funnels, and build a successful online business. Expert guides, strategies, and tips from successful entrepreneurs.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <ttl>60</ttl>
    <image>
      <url>${baseUrl}/logo/logo.png</url>
      <title>Sell Earn Direct Blog</title>
      <link>${baseUrl}/blog</link>
    </image>
${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

