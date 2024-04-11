function method1(db,username) {
    // Create a table (Example: users)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS happy_myorder_${username} (
      orderid TEXT NOT NULL,
      producttype TEXT NOT NULL,
      productname TEXT NOT NULL,
      productimgsrc TEXT NOT NULL,
      quantity TEXT NOT NULL,
      price TEXT NOT NULL,
      total TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS happy_mycart_${username} (
        orderid TEXT NOT NULL,
        producttype TEXT NOT NULL,
        productname TEXT NOT NULL,
        productimgsrc TEXT NOT NULL,
        quantity TEXT NOT NULL,
        price TEXT NOT NULL,
        total TEXT NOT NULL,
        status TEXT NOT NULL
    )
  `);
});

    console.log('This is method 1');
  }
  
//   function method2() {
//     console.log('This is method 2');
//   }
  
  module.exports = {
    method1: method1,
    //method2: method2
  };