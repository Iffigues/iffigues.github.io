---
layout: default
title: À propos
---
<section class="about-section">
    <div class="about-container">
        
        <div class="about-image">
            <img src="{{ '/assets/data/42/img/bordenoy.webp' | relative_url }}" alt="Iffigues - Développeur AFP" class="profile-card">
        </div>

        <div class="about-content">
            <h1>💡 À propos de moi</h1>
            <p class="lead"><strong>De l'École 42 à l'information mondiale.</strong></p>
            
            <p>Mon parcours est celui d'un passionné de défis. Aujourd'hui développeur à l'<strong>AFP (Agence France-Presse)</strong>, j'applique la rigueur acquise à l'École 42 au service d'une infrastructure d'information internationale.</p>

            <div class="highlights">
                <div class="highlight-item">
                    <h3>🚀 Expertise Technique</h3>
                    <p>Alumni de 42, je maîtrise les fondamentaux du bas niveau (C/C++) et l'autonomie nécessaire pour dompter n'importe quel stack moderne.</p>
                </div>

                <div class="highlight-item">
                    <h3>🏅 Rigueur Olympique</h3>
                    <p>Mon expérience de chauffeur VVIP lors des <strong>JO de Paris 2024</strong> m'a appris la gestion du stress et la logistique de précision. Un bug est un obstacle, comme un embouteillage sur le périph' : il faut trouver la déviation la plus efficace.</p>
                </div>

                <div class="highlight-item">
                    <h3>🙏 Engagement Personnel</h3>
                    <p>Mon parcours de catéchumène reflète mes valeurs : intégrité, patience et une volonté constante de progresser.</p>
                </div>
            </div>

            <div class="tech-stack">
                <span class="badge">C / C++</span>
                <span class="badge">JavaScript</span>
                <span class="badge">PostgreSQL</span>
                <span class="badge">Docker</span>
                <span class="badge">AFP Ecosystem</span>
            </div>
        </div>
    </div>
</section>

<style>
/* Le CSS pour rendre ça propre sur ton Jekyll */
.about-section {
    padding: 40px 20px;
    color: #333;
    font-family: sans-serif;
}

.about-container {
    display: flex;
    flex-wrap: wrap;
    gap: 40px;
    max-width: 1000px;
    margin: 0 auto;
    align-items: center;
}

/* La fameuse photo carrée moderne */
.profile-card {
    width: 250px;
    height: 250px;
    object-fit: cover;
    border-radius: 20px; /* Coins arrondis "Squircle" */
    border: 3px solid #0077b5;
    box-shadow: 12px 12px 0px #0077b5; /* Ombre décalée style Tech */
    transition: transform 0.3s ease;
}

.profile-card:hover {
    transform: translate(-5px, -5px);
    box-shadow: 17px 17px 0px #00a0dc;
}

.about-content {
    flex: 1;
    min-width: 300px;
}

.lead {
    font-size: 1.2rem;
    color: #0077b5;
}

.highlight-item {
    margin-bottom: 20px;
    border-left: 4px solid #eee;
    padding-left: 15px;
}

.highlight-item h3 {
    margin-bottom: 5px;
    font-size: 1.1rem;
}

.tech-stack {
    margin-top: 30px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.badge {
    background: #f0f0f0;
    padding: 5px 12px;
    border-radius: 15px;
    font-size: 0.85rem;
    font-weight: bold;
    border: 1px solid #ddd;
}

/* Responsive pour mobile */
@media (max-width: 768px) {
    .about-container {
        flex-direction: column;
        text-align: center;
    }
    .highlight-item {
        border-left: none;
        border-bottom: 1px solid #eee;
        padding: 0 0 15px 0;
    }
    .tech-stack {
        justify-content: center;
    }
}
</style>