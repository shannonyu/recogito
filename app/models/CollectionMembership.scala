package models

import play.api.db.slick.Config.driver.simple._
import scala.slick.lifted.Tag

/** Associates a GeoDocument with a collection.
  *
  * @author Rainer Simon <rainer.simon@ait.ac.at>
  */
case class CollectionMembership(id: Option[Int], gdocId: Int, collection: String)

/** Collections database table **/
class CollectionMemberships(tag: Tag) extends Table[CollectionMembership](tag, "collection_memberships") {
  
  def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
  
  def gdocId = column[Int]("gdoc", O.NotNull)
  
  def collection = column[String]("collection", O.NotNull)
  
  def collection_lowercase = column[String]("collection_lowercase", O.NotNull)
  
  def * = (id.?, gdocId, collection) <> (CollectionMembership.tupled, CollectionMembership.unapply)

}

object CollectionMemberships {
  
  private val collectionMemberships = TableQuery[CollectionMemberships]
  
  def create()(implicit s: Session) = collectionMemberships.ddl.create
  
  /** Lists all collection names **/
  def listCollections()(implicit s: Session): Seq[String] = 
    collectionMemberships.map(_.collection).list.distinct

  /** Counts the number of documents in the specified collection **/
  def countDocumentsInCollection(collection: String)(implicit s: Session): Int =
    collectionMemberships.where(_.collection.toLowerCase === collection.toLowerCase).list.size
    
  /** Returns the IDs of the documents in the specified collection **/
  def getDocumentsInCollection(collection: String)(implicit s: Session): Seq[Int] =
    collectionMemberships.where(_.collection.toLowerCase === collection.toLowerCase).map(_.gdocId).list
        
  def getUnassignedGeoDocuments()(implicit s: Session): Seq[Int] = {
    val docsInCollections = collectionMemberships.map(_.gdocId).list.distinct
    GeoDocuments.findAllExcept(docsInCollections)
  }
    
}