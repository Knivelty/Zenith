import { store } from "../store";
import { ChessMain } from "./ChessMain";
import { CreateAccount } from "./CreateAccount";
import Monster from "./monster/monster";
import React, { useEffect, useState } from 'react';

export const UI = () => {
    const [monsters, setMonsters] = useState();
    const [currentTurn, setCurrentTurn] = useState(0);
    const layers = store((state) => {
        return {
            networkLayer: state.networkLayer,
            phaserLayer: state.phaserLayer,
        };
    });


   
    const data=[
        {
            turn: 1,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 300, x: 1, y: 1 },
                { id: 2, owner: false, hp: 300, x: 8, y: 2 },
            ],
        },
        {
            turn: 2,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 300, x: 2, y: 1 },
                { id: 2, owner: false, hp: 300, x: 7, y: 2 },
            ],
        },
        {
            turn: 3,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 300, x: 3, y: 1 },
                { id: 2, owner: false, hp: 300, x: 6, y: 2 },
            ],
        },
        {
            turn: 4,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 300, x: 4, y: 2 },
                { id: 2, owner: false, hp: 250, x: 5, y: 2 },
            ],
        },
        {
            turn: 5,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 250, x:4, y: 2 },
                { id: 2, owner: false, hp: 250, x: 5, y: 2 },
            ],
        },
        {
            turn: 6,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 250, x: 4, y: 2 },
                { id: 2, owner: false, hp: 200, x: 5, y: 2 },
            ],
        },
        {
            turn: 7,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 200, x:4, y: 2 },
                { id: 2, owner: false, hp: 200, x: 5, y: 2 },
            ],
        },
        {
            turn: 8,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 200, x: 4, y: 2 },
                { id: 2, owner: false, hp: 150, x: 5, y: 2 },
            ],
        },
        {
            turn: 9,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 150, x: 4, y: 2 },
                { id: 2, owner: false, hp: 150, x: 5, y: 2 },
            ],
        },
        {
            turn: 10,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 150, x: 4, y: 2 },
                { id: 2, owner: false, hp: 100, x: 5, y: 2 },
            ],
        },
        {
            turn: 11,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 100, x: 4, y: 2 },
                { id: 2, owner: false, hp: 100, x: 5, y: 2 },
            ],
        },
        {
            turn: 12,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 100, x: 4, y: 2 },
                { id: 2, owner: false, hp: 50, x: 5, y: 2 },
            ],
        },
        {
            turn: 13,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 50, x: 4, y: 2 },
                { id: 2, owner: false, hp: 50, x: 5, y: 2 },
            ],
        },
        {
            turn: 14,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 50, x: 4, y: 2 },
                { id: 2, owner: false, hp: 0, x: 5, y: 2 },
            ],
        },
        {
            turn: 15,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 50, x: 4, y: 2 },
                // { id: 2, owner: false, hp: 0, x: 5, y: 2 },
            ],
        },
    ];

    useEffect(() => {
        
    }, []);

    const updateMonsters = (newMonsters) => {
        setMonsters(newMonsters);
    };

    const startFn = () => {
        setCurrentTurn(0);
        const timer = setInterval(() => {
            setCurrentTurn((prevTurn) => {
                const nextTurn = prevTurn + 1;
                if (nextTurn < data.length) {
                    updateMonsters(data[nextTurn].monster);
        console.log(data[nextTurn].turn)

                    return nextTurn;
                } else {
                    clearInterval(timer); 
                    return prevTurn;
                }
            });
        }, 2000); 

        return () => clearInterval(timer); 
    }

    if (!layers.networkLayer || !layers.phaserLayer) return <></>;


    return (
        <div>
            <CreateAccount />
            <ChessMain fn={startFn} />
            {/* <Monster /> */}

            <div className="relative mainBoard" >

            {monsters?.map((monster, index) => (
                <div key={index} className={`monster ${!monster.owner?"monster2":""} `} style={{ top: `${(monster.y -1) * 64}px`, left: `${(monster.x-1) * 64}px` }}>
                    <div className="health-bar-container">
                        <div className={`${monster.owner?"health-bar2":""} health-bar`} style={{ width: `${monster.hp / 300 * 100}%`, }}></div>
                    </div>
                    {/* <img src={`/assets/id${monster.id}.png`} alt="" /> */}
                </div>
            ))}
            </div>
            
        </div>
    );
};
