// src/utils/collectionManager.js
export const STORAGE_KEY = 'apiCollections';

// Get all collections
export function getCollections() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { collections: [] };
}

// Save a request to collection
export function saveCollection(collectionName, request) {
  const data = getCollections();
  const collectionIndex = data.collections.findIndex(c => c.name === collectionName);

  const requestWithId = {
    ...request,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (collectionIndex > -1) {
    data.collections[collectionIndex].requests.push(requestWithId);
  } else {
    data.collections.push({
      name: collectionName,
      requests: [requestWithId]
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// Delete a collection
export function deleteCollection(collectionName) {
  const data = getCollections();
  data.collections = data.collections.filter(c => c.name !== collectionName);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// Delete a request
export function deleteRequest(collectionName, requestId) {
  const data = getCollections();
  const collectionIndex = data.collections.findIndex(c => c.name === collectionName);

  if (collectionIndex > -1) {
    data.collections[collectionIndex].requests = 
      data.collections[collectionIndex].requests.filter(req => req.id !== requestId);
    
    if (data.collections[collectionIndex].requests.length === 0) {
      data.collections.splice(collectionIndex, 1);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// Update a request
export function updateRequest(collectionName, requestId, updatedRequest) {
  const data = getCollections();
  const collectionIndex = data.collections.findIndex(c => c.name === collectionName);

  if (collectionIndex > -1) {
    const requestIndex = data.collections[collectionIndex].requests.findIndex(
      req => req.id === requestId
    );

    if (requestIndex > -1) {
      data.collections[collectionIndex].requests[requestIndex] = {
        ...data.collections[collectionIndex].requests[requestIndex],
        ...updatedRequest,
        updatedAt: new Date().toISOString()
      };
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// Export collections to JSON file
export function exportCollections() {
  const data = getCollections();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `api-collections-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import collections from JSON file
export function importCollections(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.collections && Array.isArray(data.collections)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          resolve(data);
        } else {
          reject(new Error('Invalid file format: Expected "collections" array'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}