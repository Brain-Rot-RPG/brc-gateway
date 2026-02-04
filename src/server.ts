import app from './app';
import config from './config/config';
import microservices from './config/microservices';

app.listen(config.port, () => {
  console.log(`\n🚀 Server running on port ${config.port}`);
  console.log('\n📋 Microservices configuration:');
  Object.entries(microservices).forEach(([name, config]) => {
    console.log(`  ${name}: ${config.path} → ${config.url}`);
  });
  console.log('\n');
});