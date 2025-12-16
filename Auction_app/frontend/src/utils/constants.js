export const PRODUCT_CONDITIONS = [
  { label: 'New', value: 'new' },
  { label: 'Like New', value: 'like-new' },
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' }
];

export const SORT_OPTIONS = [
  { label: 'Newest', value: '' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Most Views', value: 'views' },
  { label: 'Most Bids', value: 'bids' },
  { label: 'Ending Soon', value: 'ending-soon' }
];

export const USER_ROLES = {
  GUEST: 'guest',
  BIDDER: 'bidder',
  SELLER: 'seller',
  ADMIN: 'admin'
};

export const PRODUCT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SOLD: 'sold',
  UNSOLD: 'unsold',
  CANCELLED: 'cancelled'
};