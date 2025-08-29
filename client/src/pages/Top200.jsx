import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Top200() {
    const [items, setItems] = useState([])
    useEffect(() => { axios.get('/api/vocab?source=top200&letter=A').then(r => setItems(r.data.items || [])).catch(() => { }); }, [])
    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-xl font-bold mb-4">Top200 (A)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((it, idx) => (
                    <div key={idx} className="p-4 bg-white rounded shadow">{it.word || JSON.stringify(it.raw)}</div>
                ))}
            </div>
        </div>
    )
}
