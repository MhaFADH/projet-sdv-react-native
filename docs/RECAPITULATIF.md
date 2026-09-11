# Récapitulatif depuis `370131dbe52507d2b9963290a2cd5e966b57cecb`

Depuis ce commit, le lot 3 a été finalisé : préférences globales de thème et de langue, adaptation complète de l’interface, couvertures et notation des ouvrages, enrichissement OpenLibrary des fiches, ainsi que l’adaptation des notes et suppressions. Les parcours ont été complétés par des tests automatisés, des audits d’accessibilité et une recette web.

À la suite des demandes, les paramètres variables de réseau et d’interface ont bien été déplacés dans `.env.local`, avec leurs valeurs documentées dans `.env.example` et `README.md`. Les variables `EXPO_PUBLIC_*` concernées couvrent notamment l’URL de l’API, les délais, les réessais, les temporisations et la durée des notifications.

Tous les prompts utilisés et les interventions associées sont consignés dans [`IA.md`](../IA.md).
