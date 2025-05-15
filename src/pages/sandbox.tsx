import { marked } from "marked";
const md = `
  ---
order-number: 1

---

> [!info] The main article in the series [[Books]]

There are many **books** related to the topics covered on this wiki, and more generally, related to the topics discussed on the [Cassiopaea Forum](https://cassiopaea.org/forum/index.php). This article series is about such books.

Currently, the main way of navigating to articles on books is the [[Recommended books|recommended books]] list.

See also
--------

*   [[Recommended books]]

External links
--------------

*   [Cassiopaea Forum board: Books](https://cassiopaea.org/forum/index.php/board,31.0.html) (Discussion board for books. Some book discussions also take place elsewhere on the Cassiopaea Forum, though.)

All ‘Books’ topics
------------------

*   [[All and Everything]] (Ten books in three series by G. I. Gurdjieff)
*   [[Recommended books]] (The current list of books recommended by the FOTCM, with links to further information and overviews of the topics concerned.)
*   [[The Wave Series]] (A book in 8 volumes that covers concepts and material integral to Cassiopaea Forum.)

`;
const SandboxPage = () => {
  console.log(marked.parse(md));
  return null;
};
export default SandboxPage;
