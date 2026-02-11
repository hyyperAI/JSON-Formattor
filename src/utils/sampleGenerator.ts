export interface SampleJSON {
  id: string;
  name: string;
  description: string;
  json: any;
}

export const SAMPLE_JSONS: SampleJSON[] = [
  {
    id: 'simple',
    name: 'Simple Object',
    description: 'A basic JSON object with common data types',
    json: {
      name: "John Doe",
      age: 30,
      isActive: true,
      hobbies: ["reading", "coding", "gaming"],
      address: {
        street: "123 Main St",
        city: "New York",
        country: "USA"
      }
    }
  },
  {
    id: 'nested',
    name: 'Deeply Nested',
    description: 'JSON with multiple levels of nesting',
    json: {
      company: {
        name: "TechCorp",
        departments: {
          engineering: {
            head: "Alice Smith",
            teams: {
              frontend: {
                lead: "Bob Johnson",
                members: ["Carol", "David", "Eve"]
              },
              backend: {
                lead: "Frank Wilson",
                members: ["Grace", "Henry"]
              }
            }
          },
          marketing: {
            head: "Ivy Chen",
            campaigns: [
              { name: "Summer Sale", budget: 50000 },
              { name: "Winter Promo", budget: 75000 }
            ]
          }
        }
      }
    }
  },
  {
    id: 'arrays',
    name: 'Complex Arrays',
    description: 'JSON with arrays of objects and mixed data',
    json: {
      users: [
        {
          id: 1,
          username: "john_doe",
          email: "john@example.com",
          roles: ["user", "admin"],
          metadata: {
            loginCount: 42,
            lastLogin: "2024-01-15T10:30:00Z"
          }
        },
        {
          id: 2,
          username: "jane_smith",
          email: "jane@example.com",
          roles: ["user"],
          metadata: {
            loginCount: 15,
            lastLogin: "2024-01-14T08:22:00Z"
          }
        },
        {
          id: 3,
          username: "bob_wilson",
          email: "bob@example.com",
          roles: ["user", "moderator"],
          metadata: {
            loginCount: 128,
            lastLogin: "2024-01-15T14:45:00Z"
          }
        }
      ],
      pagination: {
        page: 1,
        perPage: 10,
        total: 100,
        totalPages: 10
      }
    }
  },
  {
    id: 'api-response',
    name: 'API Response',
    description: 'Typical REST API response structure',
    json: {
      status: "success",
      data: {
        items: [
          {
            id: "item_001",
            name: "Product A",
            price: 29.99,
            inStock: true,
            tags: ["electronics", "sale"]
          },
          {
            id: "item_002",
            name: "Product B",
            price: 49.99,
            inStock: false,
            tags: ["clothing"]
          },
          {
            id: "item_003",
            name: "Product C",
            price: 19.99,
            inStock: true,
            tags: ["books", "bestseller"]
          }
        ],
        meta: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 50
        }
      },
      timestamp: "2024-01-15T12:00:00.000Z",
      requestId: "req_abc123xyz"
    }
  },
  {
    id: 'config',
    name: 'Configuration',
    description: 'Application configuration JSON',
    json: {
      app: {
        name: "MyApp",
        version: "1.2.3",
        environment: "production"
      },
      server: {
        host: "0.0.0.0",
        port: 8080,
        ssl: {
          enabled: true,
          certPath: "/etc/ssl/certs/",
          keyPath: "/etc/ssl/private/"
        },
        cors: {
          origins: ["https://example.com", "https://www.example.com"],
          methods: ["GET", "POST", "PUT", "DELETE"],
          credentials: true
        }
      },
      database: {
        primary: {
          driver: "postgresql",
          host: "db.example.com",
          port: 5432,
          name: "myapp_db",
          pool: {
            min: 2,
            max: 10
          }
        },
        redis: {
          host: "redis.example.com",
          port: 6379,
          keyPrefix: "myapp:"
        }
      },
      features: {
        darkMode: true,
        notifications: {
          email: true,
          push: false
        },
        experimental: ["ai_features", "beta_tools"]
      }
    }
  },
  {
    id: 'geo',
    name: 'Geographic Data',
    description: 'JSON with geographic coordinates and location data',
    json: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [-73.9857, 40.7484]
          },
          properties: {
            name: "Empire State Building",
            address: "350 5th Ave, New York, NY 10118",
            height: 443,
            yearBuilt: 1931
          }
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [-122.4194, 37.7749]
          },
          properties: {
            name: "Golden Gate Bridge",
            address: "Golden Gate Bridge, San Francisco, CA",
            yearBuilt: 1937,
            length: 2737
          }
        },
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [-0.1276, 51.5072],
              [-0.1276, 51.5073],
              [-0.1275, 51.5073],
              [-0.1275, 51.5072],
              [-0.1276, 51.5072]
            ]]
          },
          properties: {
            name: "London",
            country: "United Kingdom",
            population: 8800000
          }
        }
      ],
      metadata: {
        generated: "2024-01-15T00:00:00Z",
        attribution: "OpenStreetMap contributors"
      }
    }
  },
  {
    id: 'large',
    name: 'Large Dataset',
    description: 'JSON simulating a large data response',
    json: {
      metadata: {
        total: 1000,
        page: 1,
        perPage: 50,
        totalPages: 20
      },
      results: Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        uuid: `550e8400-e29b-41d4-a716-4466554400${String(i).padStart(3, '0')}`,
        timestamp: new Date(Date.now() - i * 86400000).toISOString(),
        status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'pending' : 'completed',
        score: Math.random() * 100,
        tags: [`tag${i % 10}`, `category${i % 5}`],
        metadata: {
          createdBy: `user_${i % 100}`,
          priority: ['low', 'medium', 'high'][i % 3],
          iterations: Math.floor(Math.random() * 1000)
        }
      }))
    }
  },
  {
    id: 'empty',
    name: 'Empty Values',
    description: 'JSON with various empty and falsy values',
    json: {
      emptyString: "",
      nullValue: null,
      zero: 0,
      falseValue: false,
      emptyArray: [],
      emptyObject: {},
      nestedEmpty: {
        deepNull: null,
        deepEmptyArray: [],
        deepEmptyObject: {}
      }
    }
  }
];

export function getSampleJSON(sampleId: string): SampleJSON | null {
  const sample = SAMPLE_JSONS.find(s => s.id === sampleId);
  return sample || null;
}

export function getAllSampleJSONs(): SampleJSON[] {
  return SAMPLE_JSONS;
}

export function getSampleJSONById(id: string): string {
  const sample = getSampleJSON(id);
  if (sample) {
    return JSON.stringify(sample.json, null, 2);
  }
  return '';
}

export function generateRandomJSON(depth: number = 3, branchingFactor: number = 3): any {
  if (depth === 0) {
    const types = [
      'string',
      'number',
      'boolean',
      'null'
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    
    switch (type) {
      case 'string':
        return Math.random().toString(36).substring(7);
      case 'number':
        return Math.floor(Math.random() * 1000);
      case 'boolean':
        return Math.random() > 0.5;
      case 'null':
        return null;
    }
  }
  
  const isArray = Math.random() > 0.5;
  
  if (isArray) {
    const length = Math.floor(Math.random() * branchingFactor) + 1;
    return Array.from({ length }, () => generateRandomJSON(depth - 1, branchingFactor));
  }
 else {
    const obj: Record<string, any> = {};
    const length = Math.floor(Math.random() * branchingFactor) + 1;
    
    for (let i = 0; i < length; i++) {
      const key = `key_${i}_${Math.random().toString(36).substring(2, 7)}`;
      obj[key] = generateRandomJSON(depth - 1, branchingFactor);
    }
    
    return obj;
  }
}

export function generateLargeJSON(itemCount: number = 100): any {
  return {
    metadata: {
      generated: new Date().toISOString(),
      itemCount,
      version: "1.0"
    },
    items: Array.from({ length: itemCount }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      description: `This is item number ${i + 1} in the collection.`,
      attributes: {
        color: ['red', 'green', 'blue', 'yellow', 'purple'][i % 5],
        size: ['small', 'medium', 'large', 'xl'][i % 4],
        weight: Math.floor(Math.random() * 100) + 1,
        active: i % 2 === 0
      },
      tags: [`tag${i % 10}`, `category${i % 5}`, `type${i % 3}`],
      timestamps: {
        created: new Date(Date.now() - i * 86400000).toISOString(),
        updated: new Date().toISOString()
      }
    }))
  };
}

export function getRandomSample(): SampleJSON {
  const randomIndex = Math.floor(Math.random() * SAMPLE_JSONS.length);
  return SAMPLE_JSONS[randomIndex];
}
