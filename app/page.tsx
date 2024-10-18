"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function Home() {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=meme-token&order=market_cap_desc&per_page=10&page=1&sparkline=false');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setCoins(data);
      } catch (error) {
        console.error('Error fetching coin data:', error);
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Trending Meme Coins</h1>
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Meme Coins by Market Cap</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Price (USD)</TableHead>
                <TableHead>24h Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coins.map((coin) => (
                <TableRow key={coin.id}>
                  <TableCell className="font-medium">
                    <Link href={`/coin/${coin.id}`} className="hover:underline">
                      {coin.name}
                    </Link>
                  </TableCell>
                  <TableCell>{coin.symbol.toUpperCase()}</TableCell>
                  <TableCell>${coin.current_price.toFixed(4)}</TableCell>
                  <TableCell>
                    <Badge variant={coin.price_change_percentage_24h > 0 ? "success" : "destructive"}>
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}