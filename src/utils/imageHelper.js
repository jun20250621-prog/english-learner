// 圖片輔助模組
// 使用 Unsplash API 獲取圖片

const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // 需要替換為你的 API Key

// 快取機制
const imageCache = {};

export const fetchImage = async (keywords, darkMode = false) => {
  const cacheKey = keywords.join(',');
  
  // 檢查快取
  if (imageCache[cacheKey]) {
    return imageCache[cacheKey];
  }

  try {
    const query = keywords.join(' ');
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Unsplash API error');
    }

    const data = await response.json();
    const imageUrl = data.urls?.regular || data.urls?.small;
    
    // 存入快取
    if (imageUrl) {
      imageCache[cacheKey] = imageUrl;
    }
    
    return imageUrl;
  } catch (error) {
    console.error('獲取圖片失敗:', error);
    return null;
  }
};

// 備用圖片（當 API 失敗時使用）
export const getFallbackImage = (keyword) => {
  const fallbackImages = {
    'default': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    'nature': 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800',
    'city': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
    'people': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    'food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    'animal': 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=800',
  };

  // 簡單關鍵詞匹配
  const key = Object.keys(fallbackImages).find(k => 
    keyword.toLowerCase().includes(k)
  );
  
  return fallbackImages[key] || fallbackImages['default'];
};
