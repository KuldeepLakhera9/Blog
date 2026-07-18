import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
  } catch (error) {
    console.error("RSS generation DB error:", error);
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const rssItems = posts
    .map((post) => {
      return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${baseUrl}/posts/${post.slug}</link>
          <guid>${baseUrl}/posts/${post.slug}</guid>
          <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
          <description><![CDATA[${post.summary}]]></description>
          ${post.category ? `<category><![CDATA[${post.category.name}]]></category>` : ""}
        </item>
      `;
    })
    .join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>DevNotes Blog</title>
        <link>${baseUrl}</link>
        <description>Guides, tutorials, and deep dives on software engineering.</description>
        <language>en-us</language>
        <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
        ${rssItems}
      </channel>
    </rss>
  `;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1200, stale-while-revalidate=600",
    },
  });
}
