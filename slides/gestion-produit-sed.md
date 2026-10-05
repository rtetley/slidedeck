---
title: Vers une définition de la gestion de produit à Inria
subtitle: Ce que les équipes-projets attendent vraiment du SED
author: SED Sophia
date: "2026"
footer: Gestion de produit à Inria  ·  SED Sophia — 2026
lang: fr
style: |
  /* Échelle de maturité : du gris (immature) au rouge Inria (envergure nationale) */
  .box.n1 .box-title { background: #9D9D9C; }
  .box.n2 .box-title { background: #6F6F6E; }
  .box.n3 .box-title { background: #1D1D1B; }
  .box.n4 .box-title { background: #85322E; }
  .box.n5 .box-title { background: #E63312; }
  .levels .box { font-size: .72em; }
  .levels .box-title { font-size: 1.3em; text-align: center; }
  .levels .box-body p:first-child { font-weight: 700; margin-bottom: .35em; }
  .levels .box-body small { display: block; border-top: 1px solid #DADADA; padding-top: .45em; margin-top: .5em; font-style: italic; }
  .value .box, .steps .box { font-size: .7em; }
  .steps .box-title { font-size: 1.05em; }
  .steps .box-body small { display: block; border-top: 1px solid #DADADA; padding-top: .45em; margin-top: .5em; }
  .value .box-title, .value .box-body { text-align: center; }
---

<!-- layout: statement -->

<small>La question de départ</small>

Quand une équipe-projet fait appel à nous, qu'est-ce qu'elle **nous achète exactement** ?

---

<!-- layout: toc -->

## Fil conducteur

---

# Nommer ce que nous faisons

---

<!-- kicker: Notre mission -->

## Ce que nous faisons réellement

:::: cols stretch
::: alert ✗ Pas ça
- Des heures-ingénieur
- Du code à la commande
- De la prestation de service standard
:::
|||
::: block ✓ Ça
- Un résultat garanti méthodologiquement
- Un logiciel qui passe d'un état à un autre
- Dans un temps borné, de façon fiable
:::
::::

---

<!-- layout: statement -->
<!-- bg: white -->

<small>Notre mission</small>

Faire passer un logiciel de recherche d'un niveau de maturité à un **niveau supérieur**, de façon fiable, dans un temps borné.

<small>C'est ça que les équipes-projets achètent. Pas des heures. Pas du code. Un saut de maturité.</small>

---

# Comprendre l'échelle de maturité

---

## Qu'est-ce qu'un niveau de maturité ?

Le SDT a récemment communiqué une **échelle institutionnelle à 5 niveaux** — peu connue, mais fondamentale. Elle définit ce que signifie concrètement « faire avancer » un logiciel de recherche. C'est le langage commun que nous devons tous partager.

:::: cols stretch
::: note Ce n'est pas un TRL
C'est une échelle d'impact scientifique et communautaire — pas une mesure de maturité technologique industrielle.
:::
|||
::: note Ce n'est pas subjectif
Chaque niveau a des critères vérifiables : un dépôt HAL, des contributeurs, des citations, une communauté.
:::
|||
::: note C'est notre boussole
Chaque ADT part d'un niveau connu et vise un niveau supérieur. C'est la définition de notre travail.
:::
::::

---

<!-- kicker: L'échelle de maturité -->

## Les 5 niveaux de l'échelle Inria

:::: cols stretch levels
::: n1 N1
Code immature

Existe sur une forge, non cartographié

<small>Pas encore dans la BIL</small>
:::
|||
::: n2 N2
Prototype

Citable, relançable par un tiers

<small>HAL + BIL + README actif</small>
:::
|||
::: n3 N3
Structurant

D'autres que les auteurs y contribuent

<small>≥ 2 permanents, mention RA</small>
:::
|||
::: n4 N4
Visible / Référence

Utilisé hors équipe, roadmap pilotée par les usages

<small>Citations externes, communauté</small>
:::
|||
::: n5 N5
Envergure nationale

Infrastructure collective, stratégie nationale

<small>TGIR, agence de programme</small>
:::
::::

La plupart de nos ADT opèrent **entre les niveaux 1 et 3** — c'est là que se joue l'essentiel de notre impact.

---

<!-- kicker: Quelques exemples -->

## Ce que « monter d'un niveau » signifie

| Logiciel      | Départ        | Cible            | Ce qui fait la différence                                   |
|:--------------|:--------------|:-----------------|:------------------------------------------------------------|
| **Integraal** | N2 — Prototype | N3 — Structurant | CI/CD, tests automatisés, documentation, ≥ 2 permanents contributeurs |
| **FedBioMed** | N2 — Prototype | N3 — Structurant | Packaging, API publique, intégration dans un projet européen |
| **Marmote**   | N1 — Immature  | N2 — Prototype   | Dépôt HAL, BIL renseignée, README installable, `CITATION.cff` |

---

<!-- kicker: La chaîne de valeur du logiciel scientifique -->

## Dans quoi s'inscrit notre travail

:::: cols stretch chain value
::: grey Code de recherche
Scripts, notebooks, prototypes
:::
|||
::: block Projet Devtech
ADT, POC++, méthode agile
:::
|||
::: grey Logiciel citable
HAL, BIL, CI/CD, documentation
:::
|||
::: grey EP + communauté
Utilisateurs, contributeurs
:::
|||
::: grey Impact scientifique
Citations, transfert, politiques publiques
:::
::::

::: note
Un projet Devtech n'est pas au bout de la chaîne — **il est au milieu**. Son but est de transformer quelque chose d'inutilisable en quelque chose d'utilisable et de citable. Ce que le logiciel devient ensuite dépend d'autres acteurs : l'EP, la communauté, les partenaires.
:::

---

## Nos deux façons d'intervenir

:::: cols stretch
::: block Mode 1 — Delivery
**L'équipe-projet nous demande de l'aide**

- Une ADT bornée dans le temps
- Le logiciel appartient à l'EP
- L'AMDT apporte la méthode et la qualité
- Cible : N1/N2 → N3 (Structurant)
- C'est notre mission centrale depuis 15 ans
:::
|||
::: example Mode 2 — Prospection (POC++)
**Nous prenons l'initiative**

- Code abandonné, doctorant parti → diagnostic
- POC++ : 2-4 mois, 0,3-0,5 ETP
- Livrable : POC fonctionnel + note de prospection
- Sortie : ADT Mode 1 / archivage / arrêt
- En cours d'expérimentation — 1<sup>er</sup> pilote à lancer
:::
::::

---

<!-- kicker: Notre vraie valeur ajoutée collective -->

## Ce que nous capitalisons entre deux projets Devtech

:::: cols
::: plain Expertise de transition
On sait quels sont les pièges du passage N2 → N3. On l'a vécu sur Diogenes, FedBioMed, Marmote. Ce savoir-faire ne repart pas avec le code.
:::

::: plain Culture agile partagée
Scrum, user stories, démos de fin de sprint, *definition of done*. Un langage commun qui permet de travailler avec n'importe quelle EP.
:::
|||
::: plain Socle scientifique et technique mutualisé
CI/CD, packaging conda, templates de dépôts, infrastructure GitLab, domaine scientifique abordé. Ce qui est construit sur une ADT sert à la suivante.
:::

::: plain Réseau de confiance
Les EP reviennent parce qu'elles font confiance à notre façon de travailler. C'est ce que 15 ans d'AMDT, entre autres, ont construit.
:::
::::

C'est ce qu'une entreprise tech appellerait l'**enablement** : ça se pilote, ça se capitalise, ça se transmet.

---

# Savoir ce qui est attendu

---

<!-- kicker: Deux positions, deux postures -->

## Ce qui est attendu de chacun

1. **Vous êtes ingénieur au SED** — en AMDT, affecté dans une EP ou en CDD\
   Votre rôle : faire avancer le logiciel vers le niveau de maturité cible défini au cadrage. Votre travail doit être documenté, commité et transmissible. Sur chaque projet, l'un d'entre vous est le *chef de projet* : il décide du comment et du quand.
2. **Vous êtes chercheur**\
   Votre rôle : porter la vision scientifique et décider du quoi. Vous validez le niveau cible et le bilan de maturité, et vous êtes disponible aux moments clés : démos, arbitrages.

---

<!-- kicker: Le rôle pivot du dispositif -->

## Le chef de projet

::: note
Le chef de projet — le *chef de projet technique* du processus DGD-I — est le lien vivant entre la vision scientifique du chercheur et le backlog de développement. C'est lui qui garantit que le travail de l'ADT sert réellement les objectifs de l'EP — et pas seulement le code.
:::

#### La règle d'arbitrage

| Domaine                                   | Qui décide                      | Exemple                                 |
|:------------------------------------------|:--------------------------------|:----------------------------------------|
| **Quoi** — priorités fonctionnelles        | Le chercheur (dernier mot)      | « D'abord le solveur 3D »               |
| **Comment / Quand** — décisions techniques | Le chef de projet (autorité)    | « On refactorise d'abord le module IO » |
| **Qualité** — standards logiciels          | Chef de projet + lead technique AMDT | CI/CD, couverture de tests, doc         |

---

<!-- kicker: Côté équipe-projet -->

## Ce qui est attendu du chercheur

:::: cols
::: plain 1 · Porter la vision scientifique
Pourquoi ce logiciel, pour qui, pour quel impact. C'est le point de départ du backlog et de la cible de maturité.
:::

::: plain 3 · Être disponible
Démos de fin de sprint, réponses aux questions de l'équipe, arbitrages. Un chercheur absent est un signal d'alerte, pas une option.
:::
|||
::: plain 2 · Décider du *quoi*
Le chercheur a le dernier mot sur les priorités fonctionnelles. Le *comment* et le *quand* restent du ressort du chef de projet.
:::

::: plain 4 · S'engager dans la durée
Viser N3, c'est viser ≥ 2 permanents contributeurs : l'EP s'engage à faire vivre le logiciel après l'ADT.
:::
::::

---

<!-- kicker: Côté SED — quel que soit votre rôle -->

## Ce qui est attendu de tout le monde

:::: cols
::: plain 1 · Connaître le niveau de maturité du logiciel
À chaque ADT : quel est le niveau de départ ? Ce n'est pas une formalité — c'est la boussole.
:::

::: plain 3 · Documenter pour le successeur
README, `CITATION.cff`, CI opérationnelle, rapport de clôture. Votre travail doit pouvoir être repris par quelqu'un qui ne vous connaît pas.
:::
|||
::: plain 2 · Savoir quel niveau on vise
La cible est définie au cadrage, visible dans le backlog, rappelée à chaque sprint. Si elle n'est pas claire, c'est un problème à signaler.
:::

::: plain 4 · Signaler quand quelque chose cloche
Backlog incohérent, chercheur absent, capacité dépassée. La transparence est une valeur du SED — pas une option.
:::
::::

---



<!-- kicker: Côté équipe-projet — le rôle du chercheur au fil de l'ADT -->

## Le chercheur, du cadrage à la clôture

:::: cols stretch chain
::: grey Au cadrage
- Formuler la vision et les utilisateurs cibles
- Valider le niveau de départ et le niveau cible
- S'engager sur une disponibilité
:::
|||
::: grey À chaque sprint
- Prioriser le backlog
- Assister à la démo de fin de sprint
- Accepter ou refuser les stories selon leurs critères
:::
|||
::: grey 2 mois avant la fin
- Valider le bilan de maturité
- Prendre la décision : arrêt / transfert / nouvelle ADT
:::
|||
::: block Après l'ADT
- Faire vivre le logiciel dans l'EP
- Le rendre visible : HAL, BIL, citations, mention RA
:::
::::

---

<!-- kicker: Un engagement réciproque -->

## Ce que chacun apporte

:::: cols stretch
::: block Le chercheur s'engage à
- Porter la vision et décider des priorités
- Être disponible aux moments clés
- Valider la cible et le bilan de maturité
- Faire vivre le logiciel après l'ADT
:::
|||
::: alert Le SED s'engage à
- Un saut de maturité garanti méthodologiquement
- Dans un temps borné, de façon fiable
- Un travail documenté et transmissible
- La transparence quand quelque chose cloche
:::
::::

---

## Ce qui change concrètement

:::: cols stretch chain
::: grey Au cadrage de chaque ADT
- Niveau de maturité du logiciel au départ renseigné
- Niveau cible défini et validé par le chercheur
- Chef de projet désigné, avec disponibilité estimée
:::
|||
::: grey À chaque story de développement
- Niveau de maturité visé mentionné
- Critère d'acceptation vérifiable (CI verte, HAL déposé…)
- Part relative R/D/C renseignée si story mixte
:::
|||
::: block 2 mois avant la fin de l'ADT
- Bilan de maturité : niveau atteint vs cible initiale
- Actions de citabilité vérifiées : HAL, BIL, `CITATION.cff`, Zenodo
- Décision explicite : arrêt / transfert / nouvelle ADT
:::
::::

---

# Comment demander des ressources

Le processus « mode projet Devtech » de la DGD-I, en version simplifiée.

---

<!-- kicker: Processus mode projet Devtech — DGD-I -->

## Le processus en 5 étapes

:::: cols stretch chain steps
::: grey 1 · Identification
Vous exprimez un besoin auprès du RSED et formalisez une « graine de projet ».

<small>Formulaire de demande</small>
:::
|||
::: grey 2 · Qualification
Faisabilité, opportunité, compétences nécessaires, risques.

<small>Note d'opportunité</small>
:::
|||
::: block 3 · Arbitrage
Chef de projet technique désigné, feuille de route, décision **GO / No Go**.

<small>Feuille de route</small>
:::
|||
::: grey 4 · Gestion et suivi
Kick-off, jalons, reporting, revue des livrables.

<small>Livrables du projet</small>
:::
|||
::: grey 5 · Fin ou poursuite
Bilan, prolongation, révision ou fin anticipée.

<small>Bilan, BIL à jour</small>
:::
::::

Le cycle reste **agile** : un projet peut revenir à une étape précédente (révision, besoin de ressources, mise en stand-by).

---

<!-- kicker: Côté chercheur -->

## Concrètement, pour demander des ressources

1. **Parlez-en au RSED de votre centre**\
   Un échange, même informel, suffit pour démarrer. C'est le point d'entrée unique.
2. **Formalisez votre besoin**\
   Formulaire « graine de projet Devtech » : enjeux, objectifs, compétences attendues. Le RSED peut vous aider à le rédiger.
3. **Construisez la feuille de route**\
   Avec le chef de projet technique désigné : durée, missions, jalons, livrables — et le niveau de maturité visé.
4. **Après le GO, impliquez-vous**\
   Fiche de poste, recrutement ou affectation, puis kick-off : le projet démarre.

---

<!-- kicker: Ce qui oriente l'arbitrage -->

## Quelle ressource pour quel projet ?

:::: cols stretch
::: block Projet « code structurant »
- Recherche en priorité d'un **ingénieur permanent** au bon profil (cartographie des compétences)
- Interclassement avec ses projets en cours
- À défaut : recrutement d'un CDD
:::
|||
::: grey Projet « code prototype »
- Recrutement d'un **CDD**
- Sur une durée et des missions bornées par la feuille de route
:::
::::

::: note
Un arbitrage positif engage les ressources nécessaires au **démarrage** du projet. Les besoins pluriannuels des projets prioritaires doivent être anticipés.
:::

---

<!-- kicker: Selon le mode de financement -->

## Qui décide ?

| Financement                                   | Type de ressource                         | Décision                              |
|:----------------------------------------------|:------------------------------------------|:--------------------------------------|
| Subvention pour charge de service public      | Création de poste (concours)              | DG                                    |
|                                               | Affectation ou mobilité d'un permanent    | DGD-I et DCR                          |
| BMI non fléché                                | CDD centre / CDD DGD-I                    | DCR / directeur DGD-I                 |
| BMI fléché — agence de programme              | CDD                                       | Agence / responsables de programme    |
| BMI fléché — PEPR                             | CDD                                       | Cellule PEPR                          |
| Contrat de recherche partenariale             | CDD                                       | DCR                                   |
| Partenaire académique (ESR)                   | Ingénieur du partenaire                   | Structure de rattachement             |

<small>Quel que soit le circuit, la demande passe par les étapes 1 et 2 et alimente la cartographie des projets. Mission Défense : circuit spécifique.</small>

---

<!-- layout: statement -->

<small>La réponse à la question de départ</small>

Quand une équipe-projet fait appel à nous, elle achète **un saut de maturité**.

<small>Pas des heures. Pas du code. Un saut de maturité garanti méthodologiquement.</small>

---

<!-- layout: statement -->
<!-- bg: white -->

<small>Une condition</small>

Pour que ce soit vrai, il faut qu'on partage **tous** la même façon de nommer, mesurer et documenter ce que nous faisons.

<small>IR, ingénieurs en AMDT ou affectés dans la durée, CDD — c'est le sens de ce cadre.</small>

---

<!-- kicker: Prochaines étapes -->

## Et maintenant ?

:::: cols stretch
::: note Les documents sont disponibles
Cadre AMDT v2 (niveaux 1-3) et complément niveaux 4-5. En cours de stabilisation — vos retours d'expérience les feront évoluer.
:::
|||
::: note Le Mode 2 POC++ se teste bientôt
Un code à potentiel dans l'écosystème Inria — un logiciel de thèse abandonné, un prototype jamais finalisé ? C'est le moment d'en parler.
:::
|||
::: note Les questions ouvertes sont réelles
Capacité réelle de l'équipe en ETP, articulation avec les SI institutionnels, financement du Mode 2 : des questions qui ont besoin de vous.
:::
::::

---

<!-- layout: end -->
