export function uid(prefix = 'id') {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
export function formatCOP(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(value);
}
export function formatDate(value, withTime = false) {
    return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    }).format(new Date(value));
}
export function getYouTubeId(url) {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : null;
}
export function getVimeoId(url) {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
}
export function getEmbedUrl(url) {
    const yt = getYouTubeId(url);
    if (yt)
        return `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1`;
    const vimeo = getVimeoId(url);
    if (vimeo)
        return `https://player.vimeo.com/video/${vimeo}?autoplay=1`;
    return null;
}
export function isImageUrl(url) {
    return /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(url);
}
export function isValidGithubUrl(url) {
    return /^https:\/\/github\.com\/[A-Za-z0-9-]{1,39}(\/[\w.-]+)?\/?$/.test(url.trim());
}
export function sanitize(text) {
    return text.replace(/[<>]/g, '').trim();
}
export function initials(name) {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}
