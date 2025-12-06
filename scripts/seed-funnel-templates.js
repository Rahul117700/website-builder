const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const funnelTemplates = [
  {
    name: 'Software Sales Funnel',
    type: 'SOFTWARE',
    description: 'Perfect for selling software, apps, or digital tools. Includes landing page, checkout, and download page.',
    previewUrl: '/templates/software.jpg',
    htmlSchema: {
      sections: [
        {
          type: 'hero',
          title: 'Revolutionary Software Solution',
          subtitle: 'Transform your business with our cutting-edge software',
          buttonText: 'Get Started Now',
          backgroundImage: '/images/software-hero.jpg'
        },
        {
          type: 'features',
          title: 'Why Choose Our Software?',
          features: [
            {
              icon: 'lightning',
              title: 'Lightning Fast',
              description: 'Optimized for speed and performance'
            },
            {
              icon: 'shield',
              title: 'Secure & Reliable',
              description: 'Enterprise-grade security features'
            },
            {
              icon: 'support',
              title: '24/7 Support',
              description: 'Round-the-clock customer support'
            }
          ]
        },
        {
          type: 'pricing',
          title: 'Choose Your Plan',
          plans: [
            {
              name: 'Basic',
              price: 99,
              features: ['Core features', 'Email support', '5GB storage']
            },
            {
              name: 'Pro',
              price: 199,
              features: ['All basic features', 'Priority support', '50GB storage', 'Advanced analytics']
            },
            {
              name: 'Enterprise',
              price: 399,
              features: ['All pro features', 'Dedicated support', 'Unlimited storage', 'Custom integrations']
            }
          ]
        }
      ]
    }
  },
  {
    name: 'Code Package Funnel',
    type: 'CODE',
    description: 'Great for selling code snippets, scripts, or development tools. Features code preview and documentation.',
    previewUrl: '/templates/code.jpg',
    htmlSchema: {
      sections: [
        {
          type: 'hero',
          title: 'Premium Code Package',
          subtitle: 'Professional code solutions for developers',
          buttonText: 'Download Now',
          backgroundImage: '/images/code-hero.jpg'
        },
        {
          type: 'codePreview',
          title: 'Code Preview',
          language: 'javascript',
          code: '// Sample code preview\nfunction amazingFunction() {\n  return "This is amazing!";\n}'
        },
        {
          type: 'features',
          title: 'What\'s Included',
          features: [
            {
              icon: 'code',
              title: 'Clean Code',
              description: 'Well-documented and optimized code'
            },
            {
              icon: 'documentation',
              title: 'Full Documentation',
              description: 'Comprehensive documentation and examples'
            },
            {
              icon: 'support',
              title: 'Developer Support',
              description: 'Technical support from our team'
            }
          ]
        }
      ]
    }
  },
  {
    name: 'Document Sales Funnel',
    type: 'DOCUMENTS',
    description: 'Perfect for selling PDFs, ebooks, guides, or templates. Includes preview and secure download.',
    previewUrl: '/templates/documents.jpg',
    htmlSchema: {
      sections: [
        {
          type: 'hero',
          title: 'Essential Business Guide',
          subtitle: 'Master your business with our comprehensive guide',
          buttonText: 'Download PDF',
          backgroundImage: '/images/document-hero.jpg'
        },
        {
          type: 'preview',
          title: 'Preview Content',
          previewPages: [
            'Chapter 1: Introduction',
            'Chapter 2: Getting Started',
            'Chapter 3: Advanced Strategies',
            'Chapter 4: Case Studies'
          ]
        },
        {
          type: 'testimonials',
          title: 'What Our Readers Say',
          testimonials: [
            {
              name: 'Sarah Johnson',
              role: 'Business Owner',
              content: 'This guide transformed my business approach completely.'
            },
            {
              name: 'Mike Chen',
              role: 'Entrepreneur',
              content: 'Invaluable insights and practical advice.'
            }
          ]
        }
      ]
    }
  },
  {
    name: 'Image Pack Funnel',
    type: 'IMAGES',
    description: 'Ideal for selling photo packs, graphics, or design assets. Features gallery preview and instant download.',
    previewUrl: '/templates/images.jpg',
    htmlSchema: {
      sections: [
        {
          type: 'hero',
          title: 'Premium Image Collection',
          subtitle: 'High-quality images for your projects',
          buttonText: 'Browse Gallery',
          backgroundImage: '/images/image-hero.jpg'
        },
        {
          type: 'gallery',
          title: 'Image Gallery',
          images: [
            '/images/gallery/1.jpg',
            '/images/gallery/2.jpg',
            '/images/gallery/3.jpg',
            '/images/gallery/4.jpg'
          ]
        },
        {
          type: 'specifications',
          title: 'Technical Specifications',
          specs: [
            'High Resolution: 300 DPI',
            'Multiple Formats: JPG, PNG, SVG',
            'Commercial License Included',
            'Instant Download'
          ]
        }
      ]
    }
  },
  {
    name: 'Video Course Funnel',
    type: 'VIDEOS',
    description: 'Perfect for selling video courses, tutorials, or premium video content. Includes preview and streaming.',
    previewUrl: '/templates/videos.jpg',
    htmlSchema: {
      sections: [
        {
          type: 'hero',
          title: 'Master Class Video Course',
          subtitle: 'Learn from industry experts with our comprehensive video course',
          buttonText: 'Start Learning',
          backgroundImage: '/images/video-hero.jpg'
        },
        {
          type: 'videoPreview',
          title: 'Course Preview',
          videoUrl: '/videos/preview.mp4',
          duration: '2:30'
        },
        {
          type: 'curriculum',
          title: 'Course Curriculum',
          modules: [
            {
              title: 'Module 1: Introduction',
              lessons: ['Welcome', 'Getting Started', 'Overview']
            },
            {
              title: 'Module 2: Fundamentals',
              lessons: ['Basics', 'Core Concepts', 'Practice Exercises']
            },
            {
              title: 'Module 3: Advanced Topics',
              lessons: ['Advanced Techniques', 'Real-world Applications', 'Final Project']
            }
          ]
        }
      ]
    }
  },
  {
    name: 'Online Course Funnel',
    type: 'WEBINAR',
    description: 'Complete course sales funnel with lessons, progress tracking, and student management.',
    previewUrl: '/templates/course.jpg',
    htmlSchema: {
      sections: [
        {
          type: 'hero',
          title: 'Complete Online Course',
          subtitle: 'Master new skills with our comprehensive online course',
          buttonText: 'Enroll Now',
          backgroundImage: '/images/course-hero.jpg'
        },
        {
          type: 'instructor',
          title: 'Meet Your Instructor',
          instructor: {
            name: 'Dr. Jane Smith',
            title: 'Industry Expert',
            bio: 'With over 10 years of experience in the field...',
            image: '/images/instructor.jpg'
          }
        },
        {
          type: 'courseContent',
          title: 'What You\'ll Learn',
          learningOutcomes: [
            'Master fundamental concepts',
            'Apply practical skills',
            'Build real-world projects',
            'Get certified upon completion'
          ]
        }
      ]
    }
  }
];

async function seedFunnelTemplates() {
  try {
    console.log('🌱 Seeding funnel templates...');

    // Clear existing templates
    await prisma.funnelTemplate.deleteMany({});

    for (const template of funnelTemplates) {
      await prisma.funnelTemplate.create({
        data: template
      });
      console.log(`✅ Created template: ${template.name}`);
    }

    console.log('🎉 Funnel templates seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding funnel templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFunnelTemplates();
