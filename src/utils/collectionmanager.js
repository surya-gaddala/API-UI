// src/utils/collectionManager.js
export const STORAGE_KEY = 'apiCollections';

export function getCollections() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { collections: [] };
}

export function saveCollection(collectionName, request) {
  const data = getCollections();
  const collectionIndex = data.collections.findIndex(c => c.name === collectionName);

  const requestWithId = {
    ...request,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  if (collectionIndex > -1) {
    // Update existing collection
    data.collections[collectionIndex].requests.push(requestWithId);
  } else {
    // Create new collection
    data.collections.push({
      name: collectionName,
      requests: [requestWithId]
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function deleteCollection(collectionName) {
  const data = getCollections();
  data.collections = data.collections.filter(c => c.name !== collectionName);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function deleteRequest(collectionName, requestId) {
  const data = getCollections();
  const collectionIndex = data.collections.findIndex(c => c.name === collectionName);

  if (collectionIndex > -1) {
    data.collections[collectionIndex].requests = 
      data.collections[collectionIndex].requests.filter(req => req.id !== requestId);
    
    // Remove collection if empty
    if (data.collections[collectionIndex].requests.length === 0) {
      data.collections.splice(collectionIndex, 1);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

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