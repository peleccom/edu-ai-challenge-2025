import { Schema } from '../src/schema';

describe('Integration Tests', () => {
  test('should handle complex real-world user profile schema', () => {
    const addressSchema = Schema.object({
      street: Schema.string().minLength(1),
      city: Schema.string().minLength(1),
      state: Schema.string().pattern(/^[A-Z]{2}$/),
      zipCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/),
      country: Schema.string().withMessage('Country is required')
    });
    
    const profileSchema = Schema.object({
      firstName: Schema.string().minLength(1).maxLength(50),
      lastName: Schema.string().minLength(1).maxLength(50),
      email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      phone: Schema.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
      birthDate: Schema.date().max(new Date()).optional()
    });
    
    const userSchema = Schema.object({
      id: Schema.string().pattern(/^[a-zA-Z0-9]+$/),
      profile: profileSchema,
      address: addressSchema.optional(),
      preferences: Schema.object({
        newsletter: Schema.boolean(),
        notifications: Schema.boolean(),
        theme: Schema.string().pattern(/^(light|dark|auto)$/).optional()
      }),
      tags: Schema.array(Schema.string().minLength(1)).minLength(0).maxLength(10),
      metadata: Schema.object({
        source: Schema.string().optional(),
        referrer: Schema.string().optional(),
        notes: Schema.array(Schema.string()).optional()
      }).optional()
    });
    
    const validUser = {
      id: 'user123abc',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-123-4567',
        birthDate: new Date('1990-01-01')
      },
      address: {
        street: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105-1234',
        country: 'USA'
      },
      preferences: {
        newsletter: true,
        notifications: false,
        theme: 'dark'
      },
      tags: ['developer', 'javascript', 'react', 'typescript'],
      metadata: {
        source: 'website',
        referrer: 'google',
        notes: ['VIP customer', 'Prefers email contact']
      }
    };
    
    const result = userSchema.validate(validUser);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data).toHaveProperty('id');
    expect(result.data).toHaveProperty('profile');
    expect((result.data as any).profile).toHaveProperty('firstName');
  });
  
  test('should handle e-commerce order schema with complex validation', () => {
    const productSchema = Schema.object({
      id: Schema.string().pattern(/^prod_[a-zA-Z0-9]+$/),
      name: Schema.string().minLength(1).maxLength(100),
      sku: Schema.string().pattern(/^[A-Z]{2}\d{4}$/),
      price: Schema.number().min(0.01),
      category: Schema.string().minLength(1),
      inStock: Schema.boolean(),
      specifications: Schema.object({
        weight: Schema.number().min(0).optional(),
        dimensions: Schema.object({
          length: Schema.number().min(0),
          width: Schema.number().min(0),
          height: Schema.number().min(0)
        }).optional(),
        color: Schema.string().optional(),
        material: Schema.string().optional()
      }).optional()
    });
    
    const orderItemSchema = Schema.object({
      product: productSchema,
      quantity: Schema.number().min(1),
      unitPrice: Schema.number().min(0),
      totalPrice: Schema.number().min(0)
    });
    
    const shippingSchema = Schema.object({
      method: Schema.string().pattern(/^(standard|express|overnight)$/),
      cost: Schema.number().min(0),
      estimatedDays: Schema.number().min(1).max(30),
      trackingNumber: Schema.string().optional()
    });
    
    const orderSchema = Schema.object({
      orderId: Schema.string().pattern(/^ORD_\d{8}$/),
      customerId: Schema.string(),
      orderDate: Schema.date(),
      items: Schema.array(orderItemSchema).minLength(1).maxLength(50),
      shipping: shippingSchema,
      billing: Schema.object({
        subtotal: Schema.number().min(0),
        tax: Schema.number().min(0),
        shipping: Schema.number().min(0),
        total: Schema.number().min(0)
      }),
      status: Schema.string().pattern(/^(pending|processing|shipped|delivered|cancelled)$/),
      notes: Schema.array(Schema.string()).optional()
    });
    
    const validOrder = {
      orderId: 'ORD_20241201',
      customerId: 'cust_12345',
      orderDate: new Date('2024-12-01'),
      items: [
        {
          product: {
            id: 'prod_laptop123',
            name: 'Gaming Laptop Pro',
            sku: 'LP1234',
            price: 1299.99,
            category: 'Electronics',
            inStock: true,
            specifications: {
              weight: 2.5,
              dimensions: {
                length: 35.0,
                width: 25.0,
                height: 2.5
              },
              color: 'Black',
              material: 'Aluminum'
            }
          },
          quantity: 1,
          unitPrice: 1299.99,
          totalPrice: 1299.99
        }
      ],
      shipping: {
        method: 'express',
        cost: 29.99,
        estimatedDays: 2,
        trackingNumber: 'TRK123456789'
      },
      billing: {
        subtotal: 1299.99,
        tax: 104.00,
        shipping: 29.99,
        total: 1433.98
      },
      status: 'processing',
      notes: ['Rush order', 'Customer requested gift wrapping']
    };
    
    const result = orderSchema.validate(validOrder);
    expect(result.success).toBe(true);
  });
  
  test('should provide detailed error paths for complex nested failures', () => {
    const schema = Schema.object({
      company: Schema.object({
        info: Schema.object({
          name: Schema.string().minLength(2),
          email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
          employees: Schema.array(Schema.object({
            id: Schema.string(),
            profile: Schema.object({
              name: Schema.string().minLength(1),
              department: Schema.string(),
              skills: Schema.array(Schema.string().minLength(1))
            })
          }))
        })
      })
    });
    
    const invalidData = {
      company: {
        info: {
          name: 'A', // Too short
          email: 'invalid-email',
          employees: [
            {
              id: 'emp1',
              profile: {
                name: 'John Doe',
                department: 'Engineering',
                skills: ['JavaScript', ''] // Empty skill
              }
            }
          ]
        }
      }
    };
    
    const result = schema.validate(invalidData);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Object field 'company'");
  });
  
  test('should handle arrays of complex objects with validation', () => {
    const studentSchema = Schema.object({
      id: Schema.string().pattern(/^STU\d{6}$/),
      personalInfo: Schema.object({
        firstName: Schema.string().minLength(1),
        lastName: Schema.string().minLength(1),
        email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        dateOfBirth: Schema.date().max(new Date())
      }),
      academicInfo: Schema.object({
        major: Schema.string(),
        year: Schema.number().min(1).max(4),
        gpa: Schema.number().min(0.0).max(4.0),
        courses: Schema.array(Schema.object({
          code: Schema.string().pattern(/^[A-Z]{2,4}\d{3,4}$/),
          name: Schema.string().minLength(1),
          credits: Schema.number().min(1).max(6),
          grade: Schema.string().pattern(/^[ABCDF][+-]?$/).optional()
        }))
      }),
      isActive: Schema.boolean()
    });
    
    const classroomSchema = Schema.object({
      classId: Schema.string(),
      instructor: Schema.string(),
      semester: Schema.string().pattern(/^(Fall|Spring|Summer)\s\d{4}$/),
      students: Schema.array(studentSchema).maxLength(30)
    });
    
    const validClassroom = {
      classId: 'CS301_001',
      instructor: 'Dr. Smith',
      semester: 'Fall 2024',
      students: [
        {
          id: 'STU123456',
          personalInfo: {
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice.johnson@university.edu',
            dateOfBirth: new Date('2001-05-15')
          },
          academicInfo: {
            major: 'Computer Science',
            year: 3,
            gpa: 3.75,
            courses: [
              {
                code: 'CS301',
                name: 'Data Structures',
                credits: 3,
                grade: 'A-'
              },
              {
                code: 'MATH210',
                name: 'Discrete Mathematics',
                credits: 4,
                grade: 'B+'
              }
            ]
          },
          isActive: true
        }
      ]
    };
    
    const result = classroomSchema.validate(validClassroom);
    expect(result.success).toBe(true);
  });
  
  test('should handle optional fields at various nesting levels', () => {
    const configSchema = Schema.object({
      app: Schema.object({
        name: Schema.string(),
        version: Schema.string().pattern(/^\d+\.\d+\.\d+$/),
        environment: Schema.string().pattern(/^(development|staging|production)$/),
        features: Schema.object({
          authentication: Schema.boolean(),
          logging: Schema.object({
            enabled: Schema.boolean(),
            level: Schema.string().pattern(/^(debug|info|warn|error)$/).optional(),
            destinations: Schema.array(Schema.string()).optional()
          }).optional(),
          cache: Schema.object({
            enabled: Schema.boolean(),
            ttl: Schema.number().min(1).optional(),
            provider: Schema.string().optional()
          }).optional()
        }).optional()
      }),
      database: Schema.object({
        host: Schema.string(),
        port: Schema.number().min(1).max(65535),
        name: Schema.string(),
        credentials: Schema.object({
          username: Schema.string(),
          password: Schema.string().minLength(8)
        }).optional()
      }).optional()
    });
    
    // Minimal configuration
    const minimalConfig = {
      app: {
        name: 'MyApp',
        version: '1.0.0',
        environment: 'development'
      }
    };
    
    expect(configSchema.validate(minimalConfig).success).toBe(true);
    
    // Full configuration
    const fullConfig = {
      app: {
        name: 'MyApp',
        version: '1.2.3',
        environment: 'production',
        features: {
          authentication: true,
          logging: {
            enabled: true,
            level: 'info',
            destinations: ['console', 'file']
          },
          cache: {
            enabled: true,
            ttl: 3600,
            provider: 'redis'
          }
        }
      },
      database: {
        host: 'localhost',
        port: 5432,
        name: 'myapp_db',
        credentials: {
          username: 'dbuser',
          password: 'securepassword123'
        }
      }
    };
    
    expect(configSchema.validate(fullConfig).success).toBe(true);
  });
}); 