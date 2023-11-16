import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.PROPERTY_API_KEY;

export async function getPropertyInfo(propertyID: string) {
  const url = `https://api.rentcast.io/v1/properties/${encodeURIComponent(propertyID)}`;
  const headers = { accept: 'application/json', 'X-Api-Key': API_KEY };

  try {
    const response = await axios.get(url, { headers });
    const json = response.data;

    if (json) {
      const lastSaleDate = json.lastSaleDate;
      const lastSalePrice = json.lastSalePrice;
      return { lastSaleDate, lastSalePrice };
    } else {
      throw new Error('No property found for the given ID');
    }
  } catch (error:any) {
    throw new Error('Error fetching property information: ' + error.message);
  }
}
