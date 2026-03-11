'use client';

import { useState } from 'react';

export default function SignBook() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const special = ['del', 'space'];
    const [filter, setFilter] = useState<'all' | 'letters' | 'special'>('all');

    const items = [
        ...(filter === 'all' || filter === 'letters' ? letters.map(l => ({ id: l, type: 'letter' })) : []),
        ...(filter === 'all' || filter === 'special' ? special.map(s => ({ id: s, type: 'special' })) : []),
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Sign Language Library</h2>
                    <p className="text-muted-foreground">Study and learn common gestures from our dataset</p>
                </div>
                <div className="flex bg-secondary p-1 rounded-lg">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('letters')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'letters' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Letters
                    </button>
                    <button
                        onClick={() => setFilter('special')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'special' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Special
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {items.map((item) => (
                    <div key={item.id} className="group bg-card rounded-xl border border-border overflow-hidden hover:border-accent hover:shadow-xl hover:shadow-accent/5 transition-all duration-300">
                        <div className="aspect-square bg-secondary/50 flex items-center justify-center overflow-hidden">
                            <img
                                src={`/signs/${item.id}.jpg`}
                                alt={`Sign for ${item.id}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/222/accent?text=' + item.id;
                                }}
                            />
                        </div>
                        <div className="p-4 flex items-center justify-between border-t border-border bg-secondary/10">
                            <span className="text-2xl font-black text-accent">{item.id}</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-2 py-1 bg-secondary rounded">
                                {item.type}
                            </span>
                        </div>
                    </div>
                ))}
            </div>


            <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 flex gap-4 items-center">
                
                <div>
                    <h3 className="font-bold text-accent-foreground">Learning Tip</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Practice each gesture daily while looking in a mirror. Consistency is key to mastering sign language fluency.
                    </p>
                </div>
            </div>
        </div>
    );
}
