'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { seedState } from './seed';
import { uid } from './format';
const STORAGE_KEY = 'lumus-state-v1';
const LumusContext = createContext(null);
function loadState() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return null;
        const parsed = JSON.parse(raw);
        return parsed.version === seedState.version ? parsed : null;
    }
    catch {
        return null;
    }
}
export function LumusProvider({ children }) {
    const [state, setState] = useState(seedState);
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        const stored = loadState();
        if (stored)
            setState(stored);
        else
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedState));
        setHydrated(true);
    }, []);
    useEffect(() => {
        if (hydrated)
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state, hydrated]);
    const setRole = useCallback((role) => setState((s) => ({ ...s, role })), []);
    const activateUser = useCallback((user) => setState((s) => {
        if (user.role === 'creador') {
            const creatorId = user.creatorId || `creator_${user.id}`;
            const existingCreator = s.creators.find(
                (creator) => creator.id === creatorId || creator.accountId === user.id,
            );
            const creator = existingCreator || {
                id: creatorId,
                accountId: user.id,
                name: user.name,
                avatar: '/placeholder-user.jpg',
                title: 'Creador independiente',
                location: 'Por definir',
                bio: '',
                skills: [],
                languages: [],
                databases: [],
                github: '',
                verified: false,
                boosted: false,
            };

            return {
                ...s,
                role: user.role,
                currentCreatorId: creator.id,
                creators: existingCreator ? s.creators : [...s.creators, creator],
            };
        }

        if (user.role === 'empresa') {
            return {
                ...s,
                role: user.role,
                currentCompany: user.companyName || user.name,
            };
        }

        return { ...s, role: user.role };
    }), []);
    const updateProfile = useCallback((patch) => setState((s) => ({
        ...s,
        creators: s.creators.map((c) => (c.id === s.currentCreatorId ? { ...c, ...patch } : c)),
    })), []);
    const addProject = useCallback((project) => setState((s) => ({
        ...s,
        projects: [
            {
                ...project,
                id: uid('p'),
                creatorId: s.currentCreatorId,
                status: 'active',
                flagged: false,
                createdAt: new Date().toISOString().slice(0, 10),
            },
            ...s.projects,
        ],
    })), []);
    const toggleFavorite = useCallback((creatorId) => {
        const willAdd = !state.favorites.includes(creatorId);
        setState((s) => ({
            ...s,
            favorites: s.favorites.includes(creatorId)
                ? s.favorites.filter((id) => id !== creatorId)
                : [...s.favorites, creatorId],
        }));
        return willAdd;
    }, [state.favorites]);
    const startThread = useCallback((creatorId, subject, body) => setState((s) => ({
        ...s,
        threads: [
            {
                id: uid('t'),
                creatorId,
                company: s.currentCompany,
                subject,
                readByCreator: false,
                readByCompany: true,
                messages: [{ id: uid('m'), from: 'empresa', body, date: new Date().toISOString() }],
            },
            ...s.threads,
        ],
    })), []);
    const replyThread = useCallback((threadId, body, from) => setState((s) => ({
        ...s,
        threads: s.threads.map((t) => t.id === threadId
            ? {
                ...t,
                readByCreator: from === 'creador',
                readByCompany: from === 'empresa',
                messages: [...t.messages, { id: uid('m'), from, body, date: new Date().toISOString() }],
            }
            : t),
    })), []);
    const markThreadRead = useCallback((threadId, by) => setState((s) => ({
        ...s,
        threads: s.threads.map((t) => t.id === threadId ? { ...t, ...(by === 'creador' ? { readByCreator: true } : { readByCompany: true }) } : t),
    })), []);
    const subscribe = useCallback((planId) => setState((s) => {
        const plan = s.plans.find((p) => p.id === planId);
        if (!plan || plan.price === 0)
            return s;
        const invoiceNumber = String(s.invoices.length + 113).padStart(4, '0');
        const purchase = {
            id: `INV-2026-${invoiceNumber}`,
            planId: plan.id,
            plan: plan.name,
            amount: plan.price,
            period: plan.period,
            creatorId: s.currentCreatorId,
            date: new Date().toISOString().slice(0, 10),
            status: 'Pagada',
        };
        return {
            ...s,
            premium: true,
            creators: s.creators.map((c) => (c.id === s.currentCreatorId ? { ...c, boosted: true } : c)),
            purchases: [purchase, ...(s.purchases ?? [])],
            invoices: [purchase, ...s.invoices],
        };
    }), []);
    const cancelSubscription = useCallback(() => setState((s) => ({
        ...s,
        premium: false,
        creators: s.creators.map((c) => (c.id === s.currentCreatorId ? { ...c, boosted: false } : c)),
    })), []);
    const setProjectHidden = useCallback((projectId, hidden) => setState((s) => ({
        ...s,
        projects: s.projects.map((p) => (p.id === projectId ? { ...p, status: hidden ? 'hidden' : 'active' } : p)),
    })), []);
    const toggleProjectFlag = useCallback((projectId) => setState((s) => ({
        ...s,
        projects: s.projects.map((p) => (p.id === projectId ? { ...p, flagged: !p.flagged } : p)),
    })), []);
    const toggleVerified = useCallback((creatorId) => setState((s) => ({
        ...s,
        creators: s.creators.map((c) => (c.id === creatorId ? { ...c, verified: !c.verified } : c)),
    })), []);
    const createTicket = useCallback((subject, description, user) => {
        const ticket = {
            id: uid('k'),
            trackingId: `LUM-${Math.floor(4900 + Math.random() * 5000)}`,
            subject,
            description,
            user,
            status: 'Abierto',
            date: new Date().toISOString().slice(0, 10),
            replies: [],
        };
        setState((s) => ({ ...s, tickets: [ticket, ...s.tickets] }));
        return ticket;
    }, []);
    const setTicketStatus = useCallback((ticketId, status) => setState((s) => ({
        ...s,
        tickets: s.tickets.map((t) => (t.id === ticketId ? { ...t, status } : t)),
    })), []);
    const replyTicket = useCallback((ticketId, body, author) => setState((s) => ({
        ...s,
        tickets: s.tickets.map((t) => t.id === ticketId
            ? {
                ...t,
                replies: [
                    ...t.replies,
                    { id: uid('r'), author, body, date: new Date().toISOString().slice(0, 10) },
                ],
            }
            : t),
    })), []);
    const resetData = useCallback(() => setState({ ...seedState, role: 'admin' }), []);
    const value = useMemo(() => ({
        state,
        hydrated,
        setRole,
        activateUser,
        updateProfile,
        addProject,
        toggleFavorite,
        startThread,
        replyThread,
        markThreadRead,
        subscribe,
        cancelSubscription,
        setProjectHidden,
        toggleProjectFlag,
        toggleVerified,
        createTicket,
        setTicketStatus,
        replyTicket,
        resetData,
    }), [
        state,
        hydrated,
        setRole,
        activateUser,
        updateProfile,
        addProject,
        toggleFavorite,
        startThread,
        replyThread,
        markThreadRead,
        subscribe,
        cancelSubscription,
        setProjectHidden,
        toggleProjectFlag,
        toggleVerified,
        createTicket,
        setTicketStatus,
        replyTicket,
        resetData,
    ]);
    return <LumusContext.Provider value={value}>{children}</LumusContext.Provider>;
}
export function useLumus() {
    const ctx = useContext(LumusContext);
    if (!ctx)
        throw new Error('useLumus must be used within LumusProvider');
    return ctx;
}
