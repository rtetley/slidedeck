---
title: Présentation du SED
subtitle: Définir ce que les équipes projets peuvent attendre de nous
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

Quand une équipe-projet fait appel au SED, à quoi peut elle s'attendre ?

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

<small>Voilà notre vraie valeur ajoutée. \
Pas des heures. Pas du code. Un saut de maturité.</small>

---

# Comprendre l'échelle de maturité

---

## Qu'est-ce qu'un niveau de maturité ?

Le SDT a récemment communiqué une **échelle institutionnelle à 5 niveaux** — peu connue, mais fondamentale. Elle définit ce que signifie concrètement « faire avancer » un logiciel de recherche.

:::: cols stretch
::: note Pas un TRL
Une échelle d'impact scientifique et communautaire — pas une mesure de maturité technologique industrielle.
:::
|||
::: note Mesures objectives
Chaque niveau a des critères vérifiables : un dépôt HAL, des contributeurs, des citations, une communauté.
:::
|||
::: note Un guide pour notre travail
Chaque ADT part d'un niveau connu et vise un niveau supérieur.
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

La plupart de nos ADT opèrent **entre les niveaux 1 et 3**.

---

<!-- kicker: Quelques exemples -->

## Concrètement, « monter d'un niveau » c'est quoi ?

| Logiciel      | Départ        | Cible            | Ce qui fait la différence                                   |
|:--------------|:--------------|:-----------------|:------------------------------------------------------------|
| **Integraal** | N2 — Prototype | N3 — Structurant | CI/CD, tests automatisés, documentation, ≥ 2 permanents contributeurs |
| **FedBioMed** | N2 — Prototype | N3 — Structurant | Packaging, API publique, intégration dans un projet européen |
| **Marmote**   | N1 — Immature  | N2 — Prototype   | Dépôt HAL, BIL renseignée, README installable, `CITATION.cff` |

---

## Nos deux façons d'intervenir

:::: cols stretch
::: block Mode 1 — Delivery
**L'équipe-projet nous demande de l'aide**

- Un projet borné dans le temps
- Le logiciel appartient à l'EP
- Le SED apporte la méthode et la qualité
- Cible : N1/N2 → N3 (Structurant), N3 → N4
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

# Savoir ce qui est attendu

---

<!-- kicker: Deux positions, deux postures -->

## Quelles attentes pour qui ?

1. **Ingénieurs au SED** — en AMDT, affecté dans une EP ou en CDD\
   Rôle : faire avancer le logiciel vers le niveau de maturité cible défini au cadrage. Le travail doit être documenté, commité et transmissible. Sur chaque projet, il y a un *chef de projet* : il décide du comment et du quand.
2. **Chercheurs demandeur de projets DevTech**\
   Rôle : porter la vision scientifique et décider du quoi. Valider le niveau cible et le bilan de maturité. Etre disponible aux moments clés : démos, arbitrages.

---

<!-- kicker: Le rôle pivot du dispositif -->

## Le chef de projet

::: note
Le chef de projet — le *chef de projet technique* du processus DGD-I — est le lien vivant entre la vision scientifique du chercheur et le backlog de développement. C'est lui qui garantit que le travail du SED sert réellement les objectifs de l'EP — et pas seulement le code.
:::

#### La règle d'arbitrage

| Domaine                                   | Qui décide                      | Exemple                                 |
|:------------------------------------------|:--------------------------------|:----------------------------------------|
| **Quoi** — priorités fonctionnelles        | Le chercheur (dernier mot)      | « D'abord le solveur 3D »               |
| **Comment / Quand** — décisions techniques | Le chef de projet (autorité)    | « On refactorise d'abord le module IO » |
| **Qualité** — standards logiciels          | Chef de projet + lead technique AMDT | CI/CD, couverture de tests, doc         |

---

<!-- kicker: Côté équipe-projet -->

## Chercheur / Demandeur

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

## Les engagements de chacun

:::: cols stretch
::: block Le chercheur s'engage à
- Porter la vision et décider des priorités
- Être disponible aux moments clés
- Valider la cible et le bilan de maturité
- Faire vivre le logiciel après la fin du projet DevTech
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

# Comment demander des ressources

Le processus « mode projet Devtech » de la DGD-I, en version simplifiée.

---

<!-- kicker: Processus mode projet Devtech — DGD-I -->

## Le processus en 5 étapes

:::: cols stretch chain steps
::: grey 1 · Identification
Expression du besoin auprès du RSED. Formalisation d'une «graine de projet».

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

---

<!-- kicker: Côté chercheur -->

## Concrètement, pour demander des ressources

1. **Parlez-en au RSED de votre centre**\
   Un échange, même informel, suffit pour démarrer. C'est le point d'entrée unique.
2. **Graine de projet**\
   Formulaire « graine de projet Devtech » sur le helpdesk. Pour démarrer un simple paragraphe d'explication suffit.
3. **Note d'opportunité**\
   Durée, missions, jalons, livrables — et le niveau de maturité visé. Un instructeur nommé assiste à la formalisation.
5. **Après le GO, impliquez-vous**\
   Fiche de poste, recrutement ou affectation, puis kick-off : le projet démarre.

---

<!-- kicker: Avis scientifique -->

## Articulation avec la CDT

La CDT apporte un **avis scientifique** sur les projets déposés. Deux organisations sont possibles :

:::: cols stretch
::: grey Option 1 — Par campagnes
- Deux campagnes par an
- Les projets sont déposés pendant la campagne, toujours via le helpdesk
- La CDT examine les projets de la campagne et donne son avis scientifique
:::
|||
::: grey Option 2 — Au fil de l'eau
- Les projets sont déposés à tout moment via le helpdesk
- Dès qu'il y a suffisamment de projets, la CDT se réunit et donne son avis scientifique
:::
::::

::: note
En bout de pipeline: la **direction du centre** et la **DGD-I** **arbitrent**. 
:::

::: note
Rien n'est figé : nous verrons **à l'usage** ce qui fonctionne le mieux.
:::


---

<!-- kicker: Prochaines étapes -->

## Et maintenant ?

:::: cols stretch
::: note Une campagne CDT est en cours
C'est le moment de déposer vos projets via le helpdesk.
:::
|||
::: note Immersions dans les équipes
Nous voudrions venir à votre rencontre. Si vous êtes intéressés, contactez-moi : [romain.tetley@inria.fr](mailto:romain.tetley@inria.fr)
:::
::::

---

<!-- layout: end -->
