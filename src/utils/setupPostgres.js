const { migrate } = require('postgres-migrations');
const { resolve } = require('path');

const { getConfig } = require('./index');

(async () => {
  const dbConfig = {
    ...getConfig().db,
    ...{
      ensureDatabaseExists: true,
      defaultDatabaseName: 'pi',
    },
  };

  console.log(JSON.stringify(dbConfig, null, 2));
  console.log(resolve('migrations'));

  await migrate(dbConfig, resolve('migrations'));
})();
