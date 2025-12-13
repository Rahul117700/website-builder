const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');
  
  try {
    // Clear existing data
    console.log('🧹 Cleaning up existing data...');
    await prisma.userSubscription.deleteMany({});
    await prisma.subscriptionPlan.deleteMany({});
    await prisma.funnel.deleteMany({});
    await prisma.funnelTemplate.deleteMany({});
    await prisma.digitalProduct.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // ================================
    // 1. Create Super Admin User
    // ================================
    console.log('👤 Creating super admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'i.am.rahul4550@gmail.com',
        name: 'Rahul - Super Admin',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        password: hashedPassword,
      },
    });
    console.log(`✅ Super Admin created: ${superAdmin.email} (Role: ${superAdmin.role})\n`);

    // ================================
    // 2. Create Subscription Plans
    // ================================
    console.log('💳 Creating subscription plans...');
    
    const plans = [
      {
        name: 'Free Starter',
        description: 'Perfect for testing and getting started',
        price: 0,
        currency: 'INR',
        duration: 365, // 1 year free
        features: [
          '2 Active Funnels',
          'Basic Analytics',
          'Email Support',
          'Standard Templates',
          'Up to 1000 visitors/month'
        ],
        maxFunnels: 2,
        maxProducts: 5,
        maxCustomDomains: 0,
        priority: 0,
        isActive: true
      },
      {
        name: 'Starter',
        description: 'Perfect for beginners getting started with funnels',
        price: 499,
        currency: 'INR',
        duration: 30, // 30 days
        features: [
          '5 Active Funnels',
          'Basic Analytics',
          'Email Support',
          'Standard Templates',
          'Up to 5000 visitors/month'
        ],
        maxFunnels: 5,
        maxProducts: 10,
        maxCustomDomains: 0,
        priority: 1,
        isActive: true
      },
      {
        name: 'Professional',
        description: 'Most popular plan for growing businesses',
        price: 999,
        currency: 'INR',
        duration: 30, // 30 days
        features: [
          '25 Active Funnels',
          'Advanced Analytics',
          'Priority Email Support',
          'All Templates',
          'Custom Branding',
          'A/B Testing',
          'Up to 25000 visitors/month',
          '2 Custom Domains'
        ],
        maxFunnels: 25,
        maxProducts: 50,
        maxCustomDomains: 2,
        priority: 2,
        isActive: true
      },
      {
        name: 'Business',
        description: 'Unlimited everything for serious businesses',
        price: 1999,
        currency: 'INR',
        duration: 30, // 30 days
        features: [
          'Unlimited Funnels',
          'Unlimited Products',
          'Unlimited Analytics',
          'Priority Phone & Email Support',
          'All Premium Templates',
          'Custom Branding',
          'A/B Testing',
          'White Label',
          'API Access',
          'Dedicated Account Manager',
          'Unlimited visitors/month',
          '5 Custom Domains'
        ],
        maxFunnels: -1, // Unlimited
        maxProducts: -1, // Unlimited
        maxCustomDomains: 5,
        priority: 3,
        isActive: true
      },
      {
        name: 'Annual Starter',
        description: 'Save 20% with annual billing - Great for beginners',
        price: 4999,
        currency: 'INR',
        duration: 365, // 1 year
        features: [
          '5 Active Funnels',
          'Basic Analytics',
          'Email Support',
          'Standard Templates',
          'Up to 5000 visitors/month',
          '🎁 2 months FREE'
        ],
        maxFunnels: 5,
        maxProducts: 10,
        maxCustomDomains: 0,
        priority: 1,
        isActive: true
      },
      {
        name: 'Annual Professional',
        description: 'Save 20% with annual billing - Most popular',
        price: 9999,
        currency: 'INR',
        duration: 365, // 1 year
        features: [
          '25 Active Funnels',
          'Advanced Analytics',
          'Priority Email Support',
          'All Templates',
          'Custom Branding',
          'A/B Testing',
          'Up to 25000 visitors/month',
          '2 Custom Domains',
          '🎁 2 months FREE'
        ],
        maxFunnels: 25,
        maxProducts: 50,
        maxCustomDomains: 2,
        priority: 2,
        isActive: true
      },
      {
        name: 'Annual Business',
        description: 'Save 20% with annual billing - Unlimited everything',
        price: 19999,
        currency: 'INR',
        duration: 365, // 1 year
        features: [
          'Unlimited Funnels',
          'Unlimited Products',
          'Unlimited Analytics',
          'Priority Phone & Email Support',
          'All Premium Templates',
          'Custom Branding',
          'A/B Testing',
          'White Label',
          'API Access',
          'Dedicated Account Manager',
          'Unlimited visitors/month',
          '10 Custom Domains',
          '🎁 2 months FREE'
        ],
        maxFunnels: -1, // Unlimited
        maxProducts: -1, // Unlimited
        maxCustomDomains: 10,
        priority: 3,
        isActive: true
      }
    ];

    for (const planData of plans) {
      const plan = await prisma.subscriptionPlan.create({
        data: planData
      });
      console.log(`   ✓ ${plan.name} - ₹${plan.price}/${plan.duration === 365 ? 'year' : 'month'}`);
    }
    console.log('✅ All subscription plans created\n');

    // ================================
    // 3. Create Funnel Templates
    // ================================
    console.log('🎨 Creating funnel templates...');
    
    const funnelTemplates = [
      {
        name: 'Software Sales Funnel',
        type: 'SOFTWARE',
        description: 'Perfect for selling software, apps, or digital tools. Includes landing page, checkout, and download page.',
        previewUrl: '/templates/software.jpg',
        isActive: true,
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
        isActive: true,
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
        isActive: true,
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
        isActive: true,
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
        isActive: true,
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
        isActive: true,
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
      },
      {
        name: 'Lead Generation Funnel',
        type: 'LEAD_GENERATION',
        description: 'Capture leads effectively with optimized forms and compelling offers.',
        previewUrl: '/templates/lead-gen.jpg',
        isActive: true,
        htmlSchema: {
          sections: [
            {
              type: 'hero',
              title: 'Get Your Free Guide',
              subtitle: 'Subscribe now and receive instant access',
              buttonText: 'Download Free',
              backgroundImage: '/images/lead-hero.jpg'
            },
            {
              type: 'benefits',
              title: 'What You\'ll Get',
              benefits: [
                'Comprehensive 50-page guide',
                'Exclusive video tutorials',
                'Weekly newsletter with tips',
                'Access to community forum'
              ]
            },
            {
              type: 'form',
              title: 'Enter Your Details',
              fields: ['name', 'email', 'phone']
            }
          ]
        }
      },
      {
        name: 'Product Launch Funnel',
        type: 'SALES',
        description: 'High-converting sales funnel for product launches with countdown timers and scarcity.',
        previewUrl: '/templates/launch.jpg',
        isActive: true,
        htmlSchema: {
          sections: [
            {
              type: 'hero',
              title: 'Limited Time Offer',
              subtitle: 'Get exclusive access before it\'s gone',
              buttonText: 'Claim Your Spot',
              backgroundImage: '/images/launch-hero.jpg',
              countdown: true,
              countdownDate: '2024-12-31T23:59:59'
            },
            {
              type: 'scarcity',
              title: 'Only 100 Spots Available',
              spotsLeft: 47
            },
            {
              type: 'benefits',
              title: 'Why Act Now?',
              benefits: [
                'Early bird discount - Save 50%',
                'Lifetime access',
                'Bonus materials worth $500',
                '30-day money-back guarantee'
              ]
            }
          ]
        }
      },
      {
        name: 'E-commerce Product Funnel',
        type: 'SALES',
        description: 'Complete e-commerce funnel for physical or digital products with shopping cart and checkout.',
        previewUrl: '/templates/ecommerce.jpg',
        isActive: true,
        htmlSchema: {
          sections: [
            {
              type: 'hero',
              title: 'Premium Product Collection',
              subtitle: 'Shop our curated selection of high-quality products',
              buttonText: 'Shop Now',
              backgroundImage: '/images/shop-hero.jpg'
            },
            {
              type: 'productGrid',
              title: 'Featured Products',
              products: [
                {
                  name: 'Product 1',
                  price: 999,
                  image: '/images/product1.jpg'
                },
                {
                  name: 'Product 2',
                  price: 1499,
                  image: '/images/product2.jpg'
                },
                {
                  name: 'Product 3',
                  price: 799,
                  image: '/images/product3.jpg'
                }
              ]
            },
            {
              type: 'guarantees',
              title: 'Our Promise',
              guarantees: [
                '30-day money-back guarantee',
                'Free shipping on orders over ₹2000',
                'Secure payment processing',
                '24/7 customer support'
              ]
            }
          ]
        }
      },
      {
        name: 'Consulting Services Funnel',
        type: 'SERVICES',
        description: 'Professional services funnel for consultants, coaches, and service providers.',
        previewUrl: '/templates/consulting.jpg',
        isActive: true,
        htmlSchema: {
          sections: [
            {
              type: 'hero',
              title: 'Expert Consulting Services',
              subtitle: 'Transform your business with professional guidance',
              buttonText: 'Book Consultation',
              backgroundImage: '/images/consulting-hero.jpg'
            },
            {
              type: 'expertise',
              title: 'Our Expertise',
              areas: [
                'Business Strategy',
                'Marketing Optimization',
                'Financial Planning',
                'Technology Integration'
              ]
            },
            {
              type: 'booking',
              title: 'Schedule Your Session',
              sessions: [
                {
                  name: '30-Min Discovery Call',
                  price: 0,
                  duration: '30 minutes'
                },
                {
                  name: '1-Hour Consultation',
                  price: 5000,
                  duration: '60 minutes'
                },
                {
                  name: 'Premium Package',
                  price: 25000,
                  duration: '5 sessions'
                }
              ]
            }
          ]
        }
      }
    ];

    for (const template of funnelTemplates) {
      const created = await prisma.funnelTemplate.create({
        data: template
      });
      console.log(`   ✓ ${created.name} (${created.type})`);
    }
    console.log('✅ All funnel templates created\n');

    // ================================
    // Summary
    // ================================
    console.log('════════════════════════════════════════');
    console.log('🎉 Database seeding completed successfully!');
    console.log('════════════════════════════════════════\n');
    
    console.log('📊 Summary:');
    console.log(`   👤 Super Admin: ${superAdmin.email}`);
    console.log(`   💳 Subscription Plans: ${plans.length} created`);
    console.log(`   🎨 Funnel Templates: ${funnelTemplates.length} created`);
    console.log('\n📝 Important Notes:');
    console.log('   • Super Admin credentials:');
    console.log(`     Email: ${superAdmin.email}`);
    console.log('     Password: admin123');
    console.log('   • All templates are active and ready to use');
    console.log('   • Plans range from Free to Annual Business');
    console.log('\n✨ Your platform is ready to go!\n');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  });
