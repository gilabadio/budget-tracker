let db;
const request = indexedDB.open('budget', 1);



request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore('records', { autoIncrement: true });
};



request.onsuccess = function (e) {
  db = e.target.result;
  if (navigator.onLine) {
    uploadRecords();
  }
};



request.onerror = function (event) {
  console.log(event.target.errorCode);
};



function saveRecord(record) {
  const transaction = db.transaction(['records'], 'readwrite');
  const records = transaction.objectStore('records');
  records.add(record);
}



function uploadRecords() {
  const transaction = db.transaction(['records'], 'readwrite');
  const records = transaction.objectStore('records');
  const getAll = records.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(['records'], 'readwrite');
          const records = transaction.objectStore('records');
          records.clear();
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
};



window.addEventListener('online', uploadRecords);