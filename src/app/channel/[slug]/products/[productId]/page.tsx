import { prisma } from '@/lib/prisma';
import ProductClient from './ProductClient';
import { Metadata } from 'next';
import { generateSEOMetadata, generateProductSchema, generateVideoSchema } from '@/utils/seo';

interface Props {
    params: { slug: string; productId: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const { slug, productId } = params;

    const product = await prisma.channelProduct.findUnique({
        where: { id: productId },
        include: {
            channel: {
                select: {
                    name: true,
                    slug: true
                }
            }
        }
    });

    if (!product) {
        return generateSEOMetadata({
            title: 'Product Not Found',
            description: 'The requested product could not be found.',
        });
    }

    const title = `${product.title} - ${product.channel.name}`;
    const description = product.description || `View ${product.title} on ${product.channel.name}'s official channel. Premium digital content and resources.`;

    return generateSEOMetadata({
        title,
        description,
        image: product.previewImage || '/logo/logo.gif',
        url: `/channel/${product.channel.slug}/products/${product.id}`,
        type: 'product',
    });
}

export default async function Page({ params }: Props) {
    const { productId } = params;

    const product = await prisma.channelProduct.findUnique({
        where: { id: productId },
        include: {
            channel: {
                select: {
                    name: true,
                    slug: true
                }
            }
        }
    });

    if (!product) return <ProductClient />;

    const isVideo = product.type === 'VIDEO';

    const schema = isVideo
        ? generateVideoSchema({
            name: product.title,
            description: product.description || '',
            thumbnailUrl: product.previewImage || '',
            uploadDate: product.createdAt.toISOString(),
            duration: product.videoDuration ? `PT${Math.floor(product.videoDuration / 60)}M${product.videoDuration % 60}S` : undefined,
        })
        : generateProductSchema({
            name: product.title,
            description: product.description || '',
            image: product.previewImage || '',
            price: Number(product.price),
            currency: product.currency,
            url: `/channel/${product.channel.slug}/products/${product.id}`
        });

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <ProductClient />
        </>
    );
}
