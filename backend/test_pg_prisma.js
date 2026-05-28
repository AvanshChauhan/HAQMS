const { PrismaClient } = require('@prisma/client');

const passwords = ['', 'admin', 'root', 'password', '123456', 'postgres', '1234'];

async function testPasswords() {
  for (const pw of passwords) {
    const url = pw 
      ? `postgresql://postgres:${pw}@localhost:5432/haqms?schema=public`
      : `postgresql://postgres@localhost:5432/haqms?schema=public`;
    
    console.log(`Testing password: "${pw}"...`);
    
    process.env.DATABASE_URL = url;
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: url
        }
      }
    });
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`\n🎉 SUCCESS! Correct password is: "${pw}"`);
      await prisma.$disconnect();
      process.exit(0);
    } catch (err) {
      console.log(`Failed: ${err.message.split('\n')[0]}`);
      await prisma.$disconnect();
    }
  }
  console.log('\n❌ All common passwords failed.');
  process.exit(1);
}

testPasswords();
